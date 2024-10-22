// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";

Deno.serve(async (req) => {
  const method = req.method;

  const authHeader = req.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const supabase = Supabase.getInstance(token);
  const payload = await verifyToken(token);

  if (!payload) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await supabase.from("user")
    .select("*")
    .eq(
      "tokenIdentifier",
      payload.sub,
    ).single();
  if (user.error) {
    return new Response(user.error.message, { status: 500 });
  }

  switch (method) {
    case "GET": {
      const id = req.url.split("/").pop();
      if (id) {
        const { data, error } = await supabase
          .from("participants")
          .select("*")
          .eq("id", id)
          .eq("userId", user.data.id)
          .single();
        if (error) {
          return new Response(error.message, { status: 500 });
        }
        return new Response(JSON.stringify(data), { status: 200 });
      } else {
        const { data, error } = await supabase
          .from("participants")
          .select("*")
          .eq("userId", user.data.id)
          .order("createdAt", { ascending: false });

        if (error) {
          return new Response(error.message, { status: 500 });
        }
        return new Response(JSON.stringify(data), { status: 200 });
      }
    }
    case "PUT": {
      const id = req.url.split("/").pop();
      if (!id) {
        return new Response("Missing participant ID", { status: 400 });
      }
      const body = await req.json();
      const { data, error } = await supabase.from("participants")
        .update(body)
        .eq("id", id).eq("userId", user.data.id);
      if (error) {
        return new Response(error.message, { status: 500 });
      }
      return new Response(JSON.stringify(data), { status: 200 });
    }
    case "DELETE": {
      const id = req.url.split("/").pop();
      if (!id) {
        return new Response("Missing participant ID", { status: 400 });
      }
      const { data, error } = await supabase.from("participants").delete().eq(
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
