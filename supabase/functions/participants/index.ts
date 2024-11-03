// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";

Deno.serve(async (req) => {
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

  const { data: userData, error: userError } = await supabase.from("user")
    .select("*")
    .eq(
      "tokenIdentifier",
      payload.sub,
    ).single();
  if (userError) {
    return new Response(userError.message, { status: 500 });
  }
  const id = req.url.split("/").pop();
  switch (method) {
    case "GET": {
      if (id) {
        const { data, error } = await supabase
          .from("participant")
          .select("*")
          .eq("meetingId", id)
          .eq("userId", userData.id)
          .single();
        if (error) {
          return new Response(error.message, { status: 500 });
        }
        return new Response(JSON.stringify(data), { status: 200 });
      } else {
        const { data, error } = await supabase
          .from("participant")
          .select("*")
          .eq("userId", userData.id)
          .order("created_at", { ascending: false });

        if (error) {
          return new Response(error.message, { status: 500 });
        }
        return new Response(JSON.stringify(data), { status: 200 });
      }
    }
    case "POST": {
      const body = await req.json();
      const { data, error } = await supabase.from("participant").upsert([
        {
          ...body,
          userId: userData.id,
        },
      ]);
      if (error) {
        return new Response(error.message, { status: 500 });
      }
      return new Response(JSON.stringify(data), { status: 200 });
    }
    case "PUT": {
      if (!id) {
        return new Response("Missing meeting ID", { status: 400 });
      }
      const { data: meetingData, error: meetingError } = await supabase.from(
        "meeting",
      )
        .select("*")
        .eq("nanoid", id)
        .single();
      if (meetingError) {
        return new Response(meetingError.message, { status: 500 });
      }
      const body = await req.json();
      console.log("userId", userData.id);
      console.log("meetingId", meetingData.id);
      console.log("body", body);
      const { data, error } = await supabase.from("participant")
        .upsert({
          ...body,
          userId: userData.id,
          meetingId: meetingData.id,
        })
        .eq("meetingId", meetingData.id)
        .eq("userId", userData.id);
      if (error) {
        return new Response(error.message, { status: 500 });
      }
      return new Response(JSON.stringify(data), { status: 200 });
    }
    case "DELETE": {
      if (!id) {
        return new Response("Missing participant ID", { status: 400 });
      }
      const { data, error } = await supabase.from("participant").delete().eq(
        "id",
        id,
      );
      if (error) {
        return new Response(error.message, { status: 500 });
      }
      return new Response(JSON.stringify(data), { status: 200 });
    }
    default: {
      return new Response("Method Not Allowed", { status: 405 });
    }
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/participants' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
