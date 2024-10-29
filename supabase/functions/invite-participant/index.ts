import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { verifyToken } from "../utils/auth.ts";
import { Supabase } from "../utils/supabase.ts";

Deno.serve(async (req) => {
  try {
    const method = req.method;
    console.log(method);
    switch (method) {
      case "POST": {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response("Authorization header missing", { status: 401 });
        }

        const bearerToken = authHeader.replace("Bearer ", "");
        const payload = verifyToken(bearerToken);
        if (!payload) return new Response("Unauthorized", { status: 401 });

        const { meetingId, userId } = await req.json();
        const apiGateWay = Deno.env.get("API_GATEWAY_URL");
        const invitationLink = new URL(`${apiGateWay}/invite-participant`);
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
        const code = url.searchParams.get("code");
        if (!code) return new Response("code is missing", { status: 400 });
      
        const meetingId = url.searchParams.get("meetingId");
        const userId = url.searchParams.get("userId");
        if (!meetingId || !userId) {
          return new Response("meetingId and userId are required", { status: 400 });
        }
        const supabase = Supabase.getInstance();

        // Fetch participants for the given meeting
        const { data: participants, error } = await supabase
          .from("participant")
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
          (participant: any) => participant.userId === userId,
        );

        if (existingParticipant) {
          return new Response("User is already a participant", { status: 200 });
        }

        // If not, add the user to the meeting's participants
        const { data: _, error: joinError } = await supabase
          .from("participant")
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
