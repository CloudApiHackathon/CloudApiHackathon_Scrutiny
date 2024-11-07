import { EmailTemplate } from "../../../components/EmailTemplate";
import { Resend } from "resend";
import { encodeToken } from "@/utils/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request): Promise<Response> {
    try {
        const { title, date, participants, meetingId } = await req.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any

        const emailPromises = participants.map((participant: string) => {
            const state = encodeToken({ meetingId, participant });
            const inviteLink =
                `${process.env.AUTH0_BASE_URL}/confirm-invite?code=${state}`;
            return resend.emails.send({
                from: "Acme <onboarding@resend.dev>",
                to: participant,
                subject: title,
                react: EmailTemplate({
                    firstName: "interviewee",
                    inviteLink: inviteLink,
                    meeting: { title, date },
                }),
            });
        });

        const results = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emailPromises.map((p: Promise<any>) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                p.catch((e: any) => console.error(e))
            ),

        ); // Handle errors for each promise
        
        console.error("Error sending emails:", results)

        for (const result of results) {
            if (result.error) {
                console.error("Error sending emails:", result);
                return Response.json({ error: result.error }, { status: 500 });
            }
        }

        // If you want to return a success message after sending all emails
        return Response.json({ message: "Emails sent successfully!" }, {
            status: 200,
        });
    } catch (error) {
        console.error("Error sending emails:", error);
        return Response.json({ error }, { status: 500 });
    }
}
