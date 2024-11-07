"use client";
import { useContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import clsx from "clsx";

// Components
import Header from "@/components/Header";

// Contexts
import { AppContext } from "@/contexts/AppProvider";

// Interfaces
interface Meeting {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

const Page = () => {
  const { user, isLoading } = useUser();
  const { setNewMeeting } = useContext(AppContext);

  // State
  const [isMeetingLoading, setIsMeetingLoading] = useState(true);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Functions
  const postMessage = async (message: string) => {
    try {
      const response = await fetch(`https://www.chatbase.co/api/v1/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CHATBASE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { content: message, role: 'user' }
          ],
          chatbotId: '8DkomxbxIgCwr5feRjfAv',  // Replace with your actual chatbot ID
          stream: false,
          model: 'gpt-3.5-turbo',
          temperature: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      console.log("Response from Chatbot:", data); // Debug output
    } catch (error) {
      console.error("Error posting message:", error);
    }
  };

  // Fetch Chatbot and meetings data
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        if (!user?.accessToken) return;
        setIsMeetingLoading(true);

        const participantsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/participants/`,
          {
            headers: { Authorization: `Bearer ${user?.accessToken}` },
          }
        );

        const participantMeetings = [
          ...new Set(
            participantsResponse.data
              .map((participant: { meetingId: any }) => participant.meetingId)
              .filter(Boolean)
          ),
        ];

        const meetingPromises = participantMeetings.map((meetingId: any) =>
          axios.get(
            `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/meetings/${meetingId}`,
            {
              headers: { Authorization: `Bearer ${user?.accessToken || ""}` },
            }
          )
        );

        const meetingResponses = await Promise.all(meetingPromises);
        const meetingsData = meetingResponses.map((response) => response.data);

        setMeetings(
          meetingsData.filter((meeting: any) => meeting.status !== "END")
        );
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setIsMeetingLoading(false);
      }
    };

    fetchParticipants();
  }, [user?.accessToken]);

  // Trigger postMessage after iframe load
  useEffect(() => {
    if (isIframeLoaded) {
      console.log("Iframe loaded, sending message...");
      postMessage("Your message after chatbot loads");
    }
  }, [isIframeLoaded]); // Depend on `isIframeLoaded`

  return (
    <div
      className={clsx(
        "flex flex-col min-h-screen w-full",
        !isLoading ? "animate-fade-in" : "opacity-0"
      )}
    >
      <Header isSidebarOpen={true} />
      <div className="flex flex-grow overflow-y-hidden">
        {/* Main Content */}
        <main className="flex-grow p-5">
          {/* Chatbot iFrame */}
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/8DkomxbxIgCwr5feRjfAv"
            width="100%"
            style={{ height: "100%", minHeight: "700px" }}
            onLoad={() => setIsIframeLoaded(true)}
          ></iframe>
        </main>
      </div>
    </div>
  );
};

export default Page;
