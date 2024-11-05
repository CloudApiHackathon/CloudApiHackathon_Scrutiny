import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { verifyToken } from "../utils/auth.ts";
import { Supabase } from "../utils/supabase.ts";

const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
};

Deno.serve(async (req) => {
  try {
    const method = req.method;
    switch (method) {
      case "POST": {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response("Authorization header missing", {
            status: STATUS.UNAUTHORIZED,
          });
        }

        const bearerToken = authHeader.replace("Bearer ", "");
        const payload = await verifyToken(bearerToken);
        if (!payload) {
          return new Response("Unauthorized", { status: STATUS.UNAUTHORIZED });
        }

        const supabase = Supabase.getInstance(bearerToken);
        const { meetingId } = await req.json();

        // Validate meetingId
        if (!meetingId) {
          return new Response("meetingId is required", {
            status: STATUS.BAD_REQUEST,
          });
        }

        try {
          const { data: user, error: userError } = await supabase
            .from("user")
            .select("*")
            .eq("tokenIdentifier", payload.sub)
            .single();
          if (userError) {
            return new Response(`Error fetching user: ${userError.message}`, {
              status: STATUS.INTERNAL_SERVER_ERROR,
            });
          }

          await supabase.from("participant").insert({
            meetingId,
            userId: user.id,
          });

          return new Response(JSON.stringify({ message: "Updating success" }), {
            status: STATUS.CREATED,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          if (error instanceof Error) {
            return new Response(error.message, { status: 500 });
          } else {
            return new Response("An unknown error occurred", { status: 500 });
          }
        }
      }

      case "GET": {
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        if (!code) {
          return new Response("Code is missing", {
            status: STATUS.BAD_REQUEST,
          });
        }

        const meetingId = url.searchParams.get("meetingId");
        const userId = url.searchParams.get("userId");
        if (!meetingId || !userId) {
          return new Response("meetingId and userId are required", {
            status: STATUS.BAD_REQUEST,
          });
        }

        const supabase = Supabase.getInstance();

        const { data: participants, error } = await supabase
          .from("participant")
          .select("*")
          .eq("meetingId", meetingId);

        if (error) {
          return new Response(`Error fetching participants: ${error.message}`, {
            status: STATUS.INTERNAL_SERVER_ERROR,
          });
        }
        if (!participants || participants.length === 0) {
          return new Response("No participants found for this meeting", {
            status: STATUS.NOT_FOUND,
          });
        }

        const existingParticipant = participants.find(
          (participant: { userId: string }) => participant.userId === userId,
        );

        if (existingParticipant) {
          return new Response("User is already a participant", {
            status: STATUS.OK,
          });
        }

        const { error: joinError } = await supabase
          .from("participant")
          .insert({ meetingId, userId });

        if (joinError) {
          return new Response(`Error joining meeting: ${joinError.message}`, {
            status: STATUS.INTERNAL_SERVER_ERROR,
          });
        }

        return Response.redirect(
          `${Deno.env.get("NEXT_URL")}/meetings/${meetingId}`,
          302,
        );
      }

      default: {
        return new Response("Method not allowed", {
          status: STATUS.METHOD_NOT_ALLOWED,
        });
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
