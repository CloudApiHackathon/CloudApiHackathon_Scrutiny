/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { nanoid } from "nanoid";
import {
  Call,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";
import { User as ChatUser, StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import { getSupabase } from "@/utils/supabase";
import LoadingOverlay from "../components/LoadingOverlay";
import { RealtimeChannel } from "@supabase/supabase-js";

type MeetProviderProps = {
  meetingId: string;
  children: React.ReactNode;
};

export const CALL_TYPE = "default";
export const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;
export const GUEST_ID = `guest_${nanoid(15)}`;

export const tokenProvider = async (userId: string = "") => {
  try {
    const response = await fetch("/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId || GUEST_ID }),
    });
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const MeetProvider = ({ meetingId, children }: MeetProviderProps) => {
  const { user: auth0User, isLoading } = useUser();
  const supabase = getSupabase();
  const channel = useRef<RealtimeChannel | null>(null);
  const [chatClient, setChatClient] = useState<StreamChat>();
  const [loading, setLoading] = useState(true);
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();
  const [messages, setMessages] = useState<any[]>([]);

  // useEffect(() => {
  //   channel.current = supabase.channel(`meeting:${meetingId}`, {
  //     config: {
  //       broadcast: {
  //         self: true,
  //       },
  //     },
  //   });

  //   channel.current
  //     .on("broadcast", { event: "message" }, ({ payload }) => {
  //       setMessages((prev) => [...prev, payload.message]);
  //     })
  //     .subscribe();

  //   return () => {
  //     channel.current?.unsubscribe();
  //     channel.current = null;
  //   };
  // }, [meetingId, supabase]);

  useEffect(() => {
    if (isLoading) return;
    const customProvider = async () => {
      const token = await tokenProvider(auth0User?.sid as string);
      return token;
    };

    const setUpChat = async (user: ChatUser) => {
      await _chatClient.connectUser(user, customProvider);
      setChatClient(_chatClient);
      setLoading(false);
    };

    let user: User;
    if (auth0User) {
      user = {
        id: auth0User.sid! as string,
        name: auth0User.name!,
        image: auth0User.picture!,
        custom: {
          username: auth0User?.username,
        },
      };
    } else {
      user = {
        id: GUEST_ID,
        type: "guest",
        name: "Guest",
      };
    }

    const _chatClient = StreamChat.getInstance(API_KEY);
    const _videoClient = new StreamVideoClient({
      apiKey: API_KEY,
      user,
      tokenProvider: customProvider,
    });
    const call = _videoClient.call(CALL_TYPE, meetingId);

    setVideoClient(_videoClient);
    setCall(call);
    setUpChat(user);

    return () => {
      _videoClient.disconnectUser();
      _chatClient.disconnectUser();
    };
  }, [auth0User, isLoading, loading, meetingId]);

  if (loading) return <LoadingOverlay />;

  return (
    <Chat client={chatClient!}>
      <StreamVideo client={videoClient!}>
        <StreamCall call={call}>{children}</StreamCall>
      </StreamVideo>
    </Chat>
  );
};

export default MeetProvider;
