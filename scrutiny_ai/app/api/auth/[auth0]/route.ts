/* eslint-disable @typescript-eslint/no-unused-vars */
import { handleAuth, handleCallback, getSession, GetLoginState, AfterCallbackAppRoute } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from 'next';
import { Session, AfterCallback } from '@auth0/nextjs-auth0';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CustomSession extends Session {
    // Add custom properties if any
}

const afterCallback: AfterCallback = async (req: NextRequest, session: Session) => {
    // if (!session || !session.user) {
    //     throw new Error('Session or user is undefined');
    // }
    const payload = {
        ...session.user,
        exp: session.user.exp * 1000,
    }
    session.user.accessToken = jwt.sign(payload, process.env.SUPABASE_SIGNING_SECRET!);
    return session;
};

export const GET = handleAuth({
    async callback(req: NextApiRequest, res: NextApiResponse) {
        try {
            const session = await handleCallback(req, res, { afterCallback });
            // await axios.post(`{process.env.NEXT_PUBLIC_API_GATEWAY_URL}/user`, {
            // })
            return session;
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                res.status((error as any).status || 500).end(error.message);
            } else {
                res.status(500).end('Unknown error');
            }
        }
    },
});