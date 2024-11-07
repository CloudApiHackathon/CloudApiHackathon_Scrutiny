// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";

const sendEmail = async (email: string, subject: string, message: string) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: email,
      subject: subject,
      html: message,
    }),
  });
  return res;
};

Deno.serve(async (req) => {
  const { meetingId, occurred_at } = await req.json();

  const data = {
    message: `Hello ${name}!`,
  };

  const supabase = Supabase.getInstance();
  const { data: participant, error: errorParticipant } = await supabase
    .from("participant")
    .select("email")
    .eq("meetingId", meetingId);

  if (errorParticipant || !participant) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch participants" }),
      { status: 500 },
    );
  }

  const message = `Meeting ${meetingId} occurred at ${occurred_at}`;
  Promise.all(
    participant.map(async (p: { email: string }) => {
      await sendEmail(p.email, "Meeting Reminder", message);
    }),
  );

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-notification' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
