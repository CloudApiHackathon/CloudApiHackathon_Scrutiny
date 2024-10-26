import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { createHmac } from "node:crypto";

export const verifyToken = async (jwt: string) => {
    try {
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(Deno.env.get("JWT_KEY")!),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"],
        );
        const payload = await verify(jwt, key);
        return payload;
    } catch (_e) {
        throw new Error("Invalid token");
    }
};

export const encodeToken = (object: any): string => {
    const header = {
        alg: "HS256",
        typ: "JWT",
    };

    const payload = {
        ...object,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expiration time (1 hour)
    };

    const secret = Deno.env.get("JWT_SECRET"); // Ensure you have a JWT_SECRET in your environment variables

    // Encode Header
    const encodedHeader = btoa(JSON.stringify(header));

    // Encode Payload
    const encodedPayload = btoa(JSON.stringify(payload));

    // Create signature
    const signature = createHmac("sha256", secret!)
        .update(`${encodedHeader}.${encodedPayload}`)
        .toString();

    // Combine parts to create the final token
    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export function decodeToken(token: string): Record<string, any> | null {
    try {
        const [header, payload, signature] = token.split(".");

        // Decode base64url payload
        const decodedPayload = atob(
            payload.replace(/-/g, "+").replace(/_/g, "/"),
        );

        // Parse the decoded JSON string
        return JSON.parse(decodedPayload);
    } catch (_) {
        throw new Error("Invalid token");
    }
}
