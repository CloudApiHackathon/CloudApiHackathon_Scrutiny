// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { decodeToken } from "../utils/auth.ts";

Deno.serve(async (req) => {
  const method = req.method;
  console.log(req.url);
  try {
    switch (method) {
      case "GET": {
        const params = new URL(req.url).searchParams;
        const authorizationCode = params.get("code");
        if (!authorizationCode) {
          return new Response(null, { status: 201 });
        }

        const response = await fetch(
          "https://dev-d786ta3x4u7k7sdc.us.auth0.com/oauth/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              grant_type: "client_credentials",
              client_id: Deno.env.get("AUTH0_CLIENT_ID"),
              client_secret: Deno.env.get("AUTH0_CLIENT_SECRET"),
              audience: "https://clientcredentials.com",
            }),
          },
        );
        const { accessToken } = await response.json();

        return new Response(
          JSON.stringify({ accessToken }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
      case "POST": {
        const { name } = await req.json();
        const data = {
          message: `Hello ${name}!`,
        };

        return new Response(
          JSON.stringify(data),
          { headers: { "Content-Type": "application/json" } },
        );
      }
      default: {
        return new Response("Method Not Allowed", { status: 405 });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    } else {
      return new Response("Unknown error", { status: 500 });
    }
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
