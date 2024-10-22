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

    const supabase = Supabase.getInstance(token);
    const method = req.method;

    switch (method) {
      case "POST": {
        const { meetingId, userId } = await req.json();
        const apiGateWay = Deno.env.get("API_GATEWAY_URL");
        const invitationLink = new URL(`${apiGateWay}/invite-participant`);
        const token = encodeToken({ meetingId, userId }); // Correct token generation
        invitationLink.searchParams.set("token", token);
        invitationLink.searchParams.set("meetingId", meetingId);
        invitationLink.searchParams.set("userId", userId);

        return new Response(
          JSON.stringify({ invitationLink: invitationLink.toString() }),
          { status: 200 },
        );
      }

      case "GET": {
        // Extract the token from the request URL (for example: /invite-participant?token=...)
        const url = new URL(req.url);
        const token = url.searchParams.get("token");
        if (!token) return new Response("Token is required", { status: 400 });

        // Decode the token to get meetingId and userId
        const payload = decodeToken(token);
        if (!payload) return new Response("Invalid token", { status: 400 });

        const { meetingId, userId } = payload;

        // Fetch participants for the given meeting
        const { data: participants, error } = await supabase
          .from("participants")
          .select("*")
          .eq("meetingId", meetingId);

        if (error) {
          return new Response(`Error fetching participants: ${error.message}`, {
            status: 500,
          });
        }
        if (!participants || participants.length === 0) {
          return new Response("No participants found for this meeting", {
            status: 404,
          });
        }

        // Check if the user is already a participant in the meeting
        const existingParticipant = participants.find(
          (participant) => participant.userId === userId,
        );

        if (existingParticipant) {
          return new Response("User is already a participant", { status: 200 });
        }

        // If not, add the user to the meeting's participants
        const { data: joinData, error: joinError } = await supabase
          .from("participants")
          .insert({ meetingId, userId });

        if (joinError) {
          return new Response(`Error joining meeting: ${joinError.message}`, {
            status: 500,
          });
        }

        return Response.redirect(
          `${Deno.env.get("NEXT_URL")}/meetings/${meetingId}`,
          302,
        );
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
