import { NextApiRequest } from "next";
import { EmailTemplate } from "../../../components/EmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextApiRequest): Promise<Response> {
    try {
        const { title, date, participants } = req.body;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emailPromises = participants.map((participant: { email: string; firstName: any; }) => {
            return resend.emails.send({
                from: "Acme <onboarding@resend.dev>",
                to: [participant.email],
                subject: title,
                react: EmailTemplate({
                    firstName: participant.firstName,
                    inviteLink: "https://example.com/invite",
                    meeting: { title, date },
                }),
            });
        });

        const results = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emailPromises.map((p: Promise<any>) => p.catch((e: any) => console.error(e))),
        ); // Handle errors for each promise

        for (const result of results) {
            if (result.error) {
                return Response.json({ error: result.error }, { status: 500 });
            }
        }

        // If you want to return a success message after sending all emails
        return Response.json({ message: "Emails sent successfully!" }, {
            status: 200,
        });
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
