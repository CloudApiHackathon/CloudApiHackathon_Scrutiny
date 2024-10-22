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

    const user = await Supabase.getInstance(token)
      .from("users")
      .select("*")
      .eq("id", payload.sub)
      .single();
    if (!user.data) return new Response("User not found", { status: 404 });
    if (user.error) {
      return new Response(`Error fetching user: ${user.error.message}`, {
        status: 500,
      });
    }

    const supabase = Supabase.getInstance(token);
    const method = req.method;
    const id = req.url.split("/").pop();

    switch (method) {
      case "GET": {
        if (id) {
          const { data, error } = await supabase
            .from("meetings")
            .select("*")
            .eq("id", id)
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
          .from("meetings")
          .select("*, participants!inner(userId)")
          .eq("participants.userId", user.data.user.id);

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
          .from("meetings")
          .insert(body)
          .select();

        if (error) {
          return new Response(
            `Error creating meeting: ${error.message}`,
            { status: 500 },
          );
        }
        if (data.length === 0) {
          return new Response("No meeting created", { status: 500 });
        }

        const meetingId = data[0].id;
        const participant = await supabase
          .from("participants")
          .insert({ useId: user.data.id, meetingId: meetingId, status: "ACCEPT" });

        if (participant.error) {
          return new Response(
            `Error adding participant: ${participant.error.message}`,
            { status: 400 },
          );
        }

        return new Response(JSON.stringify(data[0]), { status: 201 });
      }
      case "UPDATE": {
        if (!id) return new Response("Meeting ID required", { status: 400 });

        const body = await req.json();
        const { error } = await supabase
          .from("meetings")
          .update(body)
          .eq("id", id)
          .eq("userId", user.data.id);

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
          .from("meetings")
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
