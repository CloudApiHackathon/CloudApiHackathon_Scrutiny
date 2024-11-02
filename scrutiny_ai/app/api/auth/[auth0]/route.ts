/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    AfterCallbackAppRoute,
    GetLoginState,
    getSession,
    handleAuth,
    handleCallback,
} from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import { AfterCallback, Session } from "@auth0/nextjs-auth0";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CustomSession extends Session {
    // Add custom properties if any
}

const afterCallback: AfterCallback = async (
    req: NextRequest,
    session: Session,
) => {
    const user = session.idToken ? jwt.decode(session.idToken) : null;
    if (!user || typeof user !== "object") {
        throw new Error("User is undefined");
    }

    const payload = {
        ...user,
        exp: user.exp! * 1000,
    };
    session.user.accessToken = jwt.sign(
        payload,
        process.env.SUPABASE_SIGNING_SECRET!,
    );
    try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/users`, {
            role: "USER",
        }, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });
    } catch (error) {
        console.error("User already exists");
    }

    return session;
};

export const GET = handleAuth({
    async callback(req: NextApiRequest, res: NextApiResponse) {
        try {
            const session = await handleCallback(req, res, { afterCallback });
            return session;
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                res.status((error as any).status || 500).end(error.message);
            } else {
                res.status(500).end("Unknown error");
            }
        }
    },
});
