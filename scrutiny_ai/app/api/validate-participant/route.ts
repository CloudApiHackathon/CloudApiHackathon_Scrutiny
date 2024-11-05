import { decodeToken } from "@/utils/auth";

export async function POST(req: Request): Promise<Response> {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response("Authorization header missing", {
                status: 401,
            });
        }
        const bearerToken = authHeader.replace("Bearer ", "");
        const payload = decodeToken(bearerToken);
        if (!payload) return new Response("Unauthorized", { status: 401 });
        const { inviteCode } = await req.json();
        if (!inviteCode) {
            return new Response("inviteCode is required", { status: 400 });
        }
        console.log("inviteCode", inviteCode);
        const decodedInvite = decodeToken(inviteCode);
        if (!decodedInvite || !decodedInvite.participant) {
            return new Response("participant is required", { status: 400 });
        }
        if (decodedInvite.participant !== payload.email) {
            return new Response("Invalid", { status: 401 });
        }
        return new Response(
            JSON.stringify({
                participant: decodedInvite.participant,
                meetingId: decodedInvite.meetingId,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 });
        } else {
            return new Response("An unknown error occurred", { status: 500 });
        }
    }
}
