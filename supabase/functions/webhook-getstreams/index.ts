// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    console.log(`Received event type:`, payload);
    switch (payload.type) {
      case "call.ended": {
        const supabase = Supabase.getInstance();
        const id = payload.call.id;
        const { error } = await supabase
          .from("meeting")
          .update({
            ended_at: new Date(),
            status: "END",
          })
          .eq("nanoid", id);

        if (error) {
          return new Response(`Error inserting meeting: ${error.message}`, {
            status: 500,
          });
        }
        return new Response("Meeting ended", { status: 200 });
      }
      case "call.started": {
        const supabase = Supabase.getInstance();
        const id = payload.call.id;
        const { error } = await supabase
          .from("meeting")
          .update({
            started_at: new Date(),
            status: "LIVE",
          })
          .eq("nanoid", id);

        if (error) {
          return new Response(`Error inserting meeting: ${error.message}`, {
            status: 500,
          });
        }
        return new Response("Meeting started", { status: 200 });
      }
      default:
        return new Response("Hello from Functions!", { status: 200 });
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/webhook-getstreams' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
