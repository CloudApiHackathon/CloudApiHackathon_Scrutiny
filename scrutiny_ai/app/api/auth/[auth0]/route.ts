/* eslint-disable @typescript-eslint/no-unused-vars */
import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from 'next';
import { Session, AfterCallback } from '@auth0/nextjs-auth0';
import jwt from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CustomSession extends Session {
    // Add custom properties if any
}

const afterCallback: AfterCallback = async (req: NextApiRequest, res: NextApiResponse, session: CustomSession) => {
    const payload = {
        ...session.user,
        exp: session.user.exp * 1000,
    }
    session.user.accessToken = jwt.sign(payload, process.env.SUPABASE_SIGNING_SECRET!);
    return session;
};

export const GET = handleAuth(
//     {
//     async callback(req: NextApiRequest, res: NextApiResponse) {
//         try {
//             await handleCallback(req, res, { afterCallback });
//         } catch (error) {
//             if (error instanceof Error) {
//                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                 res.status((error as any).status || 500).end(error.message);
//             } else {
//                 res.status(500).end('Unknown error');
//             }
//         }
//     },
// }
);