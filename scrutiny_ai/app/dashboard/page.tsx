"use client";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Header from "@/components/Header";
import { Calendar } from "@nextui-org/calendar";
import clsx from "clsx";
import axios from "axios";
import MeetingCard from "@/components/MeetingCard";
import Spinner from "@/components/Spinner";
import Folder from "@/components/icons/Folder";

const Page = () => {
  const { user, isLoading } = useUser();
  const [isMeetingLoading, setIsMeetingLoading] = useState(true);
  interface Meeting {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
  }
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);


  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        if (!user?.accessToken) return;
        setIsMeetingLoading(true);
        const participantsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/participants/`,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );

        // Extract participant meeting IDs
        const participantMeetings = participantsResponse.data.map(
          (participant: { meetingId: any }) => participant.meetingId
        );

        // Use Promise.all to fetch all meetings in parallel
        const meetingPromises = participantMeetings.map((meetingId: any) =>
          axios.get(
            `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/meetings/${meetingId}`,
            {
              headers: {
                Authorization: `Bearer ${user?.accessToken || ""}`,
              },
            }
          )
        );

        // Wait for all meeting requests to complete
        const meetingResponses = await Promise.all(meetingPromises);

        // Extract meeting data from the responses
        const meetingsData = meetingResponses.map((response) => response.data);

        // Update the state with all meetings at once
        setMeetings(meetingsData.filter((meeting: any) => meeting.status !== "END"));
      } catch (error) {
        console.error(error);
      } finally {
        setIsMeetingLoading(false);
      }
    };

    fetchParticipants();
  }, [user?.accessToken]);

  return (
    <div>
      <Header />
      <div
        className={clsx("flex", !isLoading ? "animate-fade-in" : "opacity-0")}
      >
        {/* Sidebar */}
        <aside
          id="default-sidebar"
          className="mt-5 w-64 h-screen bg-white shadow-lg rounded-xl p-4 text-gray-700 shadow-blue-gray-900/5 hidden sm:block"
        >
          <ul className="space-y-2 font-medium">
            <li>
              <a
                href="/dashboard"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 18"
                >
                  <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Overview</span>
              </a>
            </li>
            <li>
              <a
                href="/dashboard/storage"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <Folder className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="flex-1 ml-3 whitespace-nowrap">Storage</span>
              </a>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-hidden">
          <div className="flex h-screen">
            {/* Left side - 3/4 width */}
            <div className="w-4/5 p-4 bg-white">
              <div className="flex flex-col items-start justify-center h-auto p-6 overflow-y-auto">
                <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                  Upcoming Meetings
                </h1>
                <div className="mt-10 w-full h-full flex-1 justify-center items-center">
                  {isMeetingLoading ? (
                    <div className="flex items-center justify-center items-center">
                      <Spinner />
                    </div>
                  ) : (
                    <div className="space-y-4 w-full">
                      {meetings.map((meetings) => (
                        <MeetingCard
                          key={meetings.id}
                          meeting={meetings}
                          className="w-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - 1/4 width */}
            <div className="w-1/5 p-4 flex justify-center mt-10">
              {/* Centered Calendar component */}
              <Calendar
                style={{
                  borderRadius: "1rem",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                  height: "fit-content",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
