import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Authorization header missing", { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) return new Response("Unauthorized", { status: 401 });

    const { data: userData, error: userError } = await Supabase.getInstance(
      token,
    )
      .from("user")
      .select("id")
      .eq("tokenIdentifier", payload.sub)
      .single();

    if (userError) {
      return new Response(`Error fetching user: ${userError.message}`, {
        status: 500,
      });
    }

    const supabase = Supabase.getInstance(token);
    const method = req.method;
    const id = req.url.split("/").pop();
    const query = new URL(req.url).searchParams;
    const nanoid = query.get("nanoid");
    console.log("nanoid", nanoid);
    switch (method) {
      case "GET": {
        if (nanoid) {
          const { data, error } = await supabase
            .from("meeting")
            .select("*")
            .eq("nanoid", nanoid)
            .single();

          if (error) {
            return new Response(`Error fetching meeting: ${error.message}`, {
              status: 500,
            });
          }
          if (!data) return new Response("Meeting not found", { status: 404 });

          return new Response(JSON.stringify(data), { status: 200 });
        }
        if (id) {
          const { data, error } = await supabase
            .from("meeting")
            .select("*, participant!inner(userId)")
            .eq("participant.userId", userData.id)
            .eq("participant.meetingId", id)
            .single();

          if (error) {
            return new Response(`Error fetching meeting: ${error.message}`, {
              status: 500,
            });
          }
          if (!data) return new Response("Meeting not found", { status: 404 });

          return new Response(JSON.stringify(data), { status: 200 });
        }

        const { data, error } = await supabase
          .from("meeting")
          .select("*, participant!inner(userId)")
          .eq("participant.userId", userData.id);

        if (error) {
          return new Response(`Error fetching meetings: ${error.message}`, {
            status: 500,
          });
        }

        return new Response(JSON.stringify(data), { status: 200 });
      }
      case "POST": {
        const body = await req.json();
        const { data, error } = await supabase
          .from("meeting")
          .insert(body)
          .select();

        if (error) {
          return new Response(
            `Error creating meeting: ${error.message}`,
            { status: 500 },
          );
        }
        return new Response(JSON.stringify(data), { status: 201 });
      }
      case "PUT": {
        if (!id) return new Response("Meeting ID required", { status: 400 });

        const body = await req.json();
        const { error } = await supabase
          .from("meeting")
          .update(body)
          .eq("nanoid", id);

        if (error) {
          return new Response(`Error updating meeting: ${error.message}`, {
            status: 500,
          });
        }

        return new Response("Meeting updated", { status: 200 });
      }
      case "DELETE": {
        if (!id) return new Response("Meeting ID required", { status: 400 });

        const { error } = await supabase
          .from("meeting")
          .delete()
          .eq("id", id);

        if (error) {
          return new Response(`Error deleting meeting: ${error.message}`, {
            status: 500,
          });
        }

        return new Response("Meeting deleted", { status: 204 });
      }
      default:
        return new Response("Method not allowed", { status: 405 });
    }
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    } else {
      return new Response("An unknown error occurred", { status: 500 });
    }
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/meetings' \
    --header 'Authorization: Bearer <your_token_here>' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
