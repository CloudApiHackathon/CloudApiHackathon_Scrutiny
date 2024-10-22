// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { decodeToken, encodeToken, verifyToken } from "../utils/auth.ts";
import { Supabase } from "../utils/supabase.ts";

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
    const id = req.url.split("/").pop();
    const supabase = Supabase.getInstance(token);

    const method = req.method;
    switch (method) {
      case "POST": {
        const apiGateWay = Deno.env.get("API_GATEWAY_URL");
        const token = await encodeToken(id!);
        const invitationLink = `${apiGateWay}/invite-participant/${token}`;
        return new Response(
          JSON.stringify({
            invitationLink,
          }),
          { status: 200 },
        );
      }
      case "GET": {
        const payload = decodeToken(id!);
        if (!payload) return new Response("Invalid token", { status: 400 });
        const meetingId = (payload[0] as string).split(".")[0];
        const { data, error } = await supabase
          .from("participants")
          .select("*")
          .eq("meetingId", meetingId);

        if (error) {
          return new Response(`Error fetching participants: ${error.message}`, {
            status: 500,
          });
        }
        if (!data) {
          return new Response("Participants not found", { status: 404 });
        }

        const join = await supabase
          .from("participants")
          .insert({
            meetingId,
            userId: user.data.id,
          });

        return new Response(JSON.stringify(join.data), { status: 200 });
      }
      default: {
        return new Response("Method not allowed", { status: 405 });
      }
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/invite-participant' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
