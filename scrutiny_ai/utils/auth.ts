import jwt, { JwtPayload } from 'jsonwebtoken';

// Ensure the secret is available from environment variables
const SECRET = process.env.SUPABASE_SIGNING_SECRET;
if (!SECRET) {
    throw new Error("SUPABASE_SIGNING_SECRET is not defined");
}

// Function to decode and verify the JWT
export const decodeToken = (token: string): JwtPayload | null => {
    try {
        // Verify the token using the secret and return the decoded payload
        const decoded = jwt.verify(token, SECRET) as JwtPayload;
        return decoded;
    } catch (error) {
        console.error("Invalid token signature or token expired:", error);
        return null;
    }
};

// Function to encode data into a JWT
export const encodeToken = (payload: { [key: string]: string }): string => {
    // Set token expiration to 3 days (72 hours)
    const options = { expiresIn: '3d' };
    // Sign and return the token
    const token = jwt.sign(payload, SECRET, options);
    return token;
};