import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";

Deno.serve(async (req) => {
  try {
    const method = req.method;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response("Authorization header missing", { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { data: user, error: userError } = await supabase
      .from("user")
      .select("*")
      .eq("tokenIdentifier", payload.sub)
      .single();

    if (userError) {
      return new Response(userError.message, { status: 401 });
    }

    switch (method) {
      case "GET": {
        const { data: resume, error: resumeError } = await supabase
          .from("resume")
          .select("*")
          .eq("userId", user.id);

        if (resumeError) {
          return new Response(resumeError.message, { status: 500 });
        }

        await Promise.all(
          resume.map(async (r: { fileName: any; signedUrlError: any; signedUrl: any; }) => {
            console.log("file", r);
            try {
              const { data, error } = await supabase.storage
                .from("storages")
                .createSignedUrl(r.fileName, 60);

              if (error) {
                console.error(`Error creating signed URL for ${r.fileName}:`, error.message);
                r.signedUrlError = error.message;
              } else {
                r.signedUrl = data?.signedUrl;
              }
            } catch (err) {
              console.error(`Unexpected error for ${r.fileName}:`, err);
            }
          })
        );

        return new Response(JSON.stringify(resume), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      case "POST": {
        try {
          const formData = await req.formData();
          const file = formData.get("file") as File | null;
          if (!file) {
            return new Response("File missing in request", { status: 400 });
          }

          const fileName = file.name.split("\\").pop()!;
          const { data, error } = await supabase.storage
            .from("storages")
            .upload(fileName, file);

          if (error) {
            return new Response(JSON.stringify(error), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const { error: recordingError } = await supabase
            .from("resume")
            .insert([{ userId: user.id, bucket: data.id, fileName }]);

          if (recordingError) {
            return new Response(recordingError.message, { status: 500 });
          }

          return new Response(null, { status: 204 });
        } catch (uploadError) {
          console.error("Error in file upload:", uploadError);
          return new Response("Error in file upload", { status: 500 });
        }
      }

      default:
        return new Response("Method not allowed", { status: 405 });
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response(error instanceof Error ? error.message : "An unknown error occurred", {
      status: 500,
    });
  }
});
