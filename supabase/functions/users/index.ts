// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";

Deno.serve(async (req) => {
  try {
    const method = req.method;

    const authHeader = req.headers.get("Authorization")!;
    if (!authHeader) {
      return new Response("Authorization header missing", { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);
    if (!payload) {
      return new Response("Unauthorized", { status: 401 });
    }

    switch (method) {
      case "GET": {
        const { data: userData, error: userError } = await supabase.from("user")
          .select("*")
          .eq(
            "tokenIdentifier",
            payload.sub,
          ).single();

        if (userError) {
          return new Response(userError.message, { status: 401 });
        }
        const id = req.url.split("/").pop();
        if (id == "all") {
          if (userData.role !== "ADMIN") {
            return new Response("Unauthorized", { status: 401 });
          }
          const { data, error } = await supabase.from("user").select("*");
          if (error) {
            return new Response(error.message, { status: 500 });
          }
          return new Response(JSON.stringify(data), { status: 200 });
        } else if (id == "me") {
          if (userData.count === 0) {
            return new Response("User not found", { status: 404 });
          }
          return new Response(JSON.stringify(userData), { status: 200 });
        } else {
          const { data, error } = await supabase
            .from("user")
            .select("*")
            .eq("id", id);

          if (error) {
            return new Response(error.message, { status: 500 });
          }
          return new Response(JSON.stringify(data), { status: 200 });
        }
      }
      case "POST": {
        const body = await req.json();
        const { data, error } = await supabase.from("user").insert(body);
        if (error) {
          return new Response(error.message, { status: 500 });
        }
        return new Response(JSON.stringify(data), { status: 200 });
      }
      case "PUT": {
        const { data: userData, error: userError } = await supabase.from("user")
          .select("*")
          .eq(
            "tokenIdentifier",
            payload.sub,
          ).single();

        if (userError) {
          return new Response(userError.message, { status: 401 });
        }
        const body = await req.json();
        const { data, error } = await supabase.from("user").update(body).eq(
          "id",
          userData.id,
        );
        if (error) {
          return new Response(error.message, { status: 500 });
        }
        return new Response(JSON.stringify(data), { status: 200 });
      }
      case "DELETE": {
        const { data: userData, error: userError } = await supabase.from("user")
          .select("*")
          .eq(
            "tokenIdentifier",
            payload.sub,
          ).single();

        if (userError) {
          return new Response(userError.message, { status: 401 });
        }
        const { data, error } = await supabase.from("user").delete().eq(
          "id",
          userData.id,
        );
        if (error) {
          return new Response(error.message, { status: 500 });
        }
        return new Response(JSON.stringify(data), { status: 200 });
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/users' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
