import { verify, decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(Deno.env.get("JWT_KEY")!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
);

export const verifyToken = async (jwt: string) => {
    try {
        const payload = await verify(jwt, key);
        return payload;
    } catch (_e) {
        return null;
    }
};

export const encodeToken = async (payload: string) => {
    payload += payload + "." + Date.now();
    return await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
}

export const decodeToken = (jwt: string) => { 
    return decode(jwt);
}