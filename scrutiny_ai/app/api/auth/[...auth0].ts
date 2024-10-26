import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from 'next';
import { Session, AfterCallback } from '@auth0/nextjs-auth0';
import jwt from 'jsonwebtoken';
import exp from "constants";

interface CustomSession extends Session {
    // Add custom properties if any
}

const afterCallback: AfterCallback = async (req: NextApiRequest, res: NextApiResponse, session: CustomSession) => {
    const payload = {
        ...session.user,
        exp: session.user.exp * 1000,
    }
    session.user.accessToken = jwt.sign(payload, process.env.JWT_SECRET!);
    return session;
};

export default handleAuth({
    async callback(req: NextApiRequest, res: NextApiResponse) {
        try {
            await handleCallback(req, res, { afterCallback });
        } catch (error) {
            if (error instanceof Error) {
                res.status((error as any).status || 500).end(error.message);
            } else {
                res.status(500).end('Unknown error');
            }
        }
    },
});