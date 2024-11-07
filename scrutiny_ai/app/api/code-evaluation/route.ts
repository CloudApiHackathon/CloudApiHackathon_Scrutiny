import { NextApiRequest, NextApiResponse } from "next";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { decodeToken } from "@/utils/auth";

// Load the gRPC service definition from the .proto file
const PROTO_PATH = "./proto/job.proto"; // Adjust this path if necessary

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

// Create a gRPC client for the 'Job' service
const client = new proto.ExecutionEngine.Job(
    "api.wxx9248.top:50051", // Replace with the address of your gRPC server
    grpc.credentials.createInsecure(), // Use proper credentials in production
);

// Define the request payload based on JobRequest message

export async function POST(request: Request) {
    try {
        
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return new Response("Authorization header missing", {
                status: 401,
            });
        }
        const bearerToken = authHeader.replace("Bearer ", "");
        const payload = decodeToken(bearerToken);
        if (!payload) return new Response("Unauthorized", { status: 401 });

        const data = await request.json();

        // Wrap the gRPC client call in a Promise to handle async behavior properly
        return new Promise<Response>((resolve, reject) => {
            client.Submit(data, (error: any, response: any) => {
                if (error) {
                    console.error("Error:", error);
                    reject(new Response("Internal Server Error", { status: 500 }));
                } else {
                    console.log("gRPC Response:", response);
                    resolve(new Response("OK", { status: 200 }));
                }
            });
        });

    } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
