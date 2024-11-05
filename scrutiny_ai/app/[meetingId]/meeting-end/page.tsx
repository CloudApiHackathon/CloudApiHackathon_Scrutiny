"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CallingState, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";

interface MeetingEndProps {
  params: {
    meetingId: string;
  };
  searchParams?: {
    invalid: string;
  };
}

const MeetingEnd = ({ params, searchParams }: MeetingEndProps) => {
  const { meetingId } = params;
  const { user } = useUser();
  const router = useRouter();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [countdown, setCountdown] = useState(60);
  const isInvalidMeeting = searchParams?.invalid === "true";

  // Function to update participant status
  const updateParticipantStatus = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/participants/${meetingId}`,
        { status: "LEAVE" },
        { headers: { Authorization: `Bearer ${user?.accessToken || ""}` } }
      );
    } catch (error) {
      console.error("Error updating participant status:", error);
    }
  };

  // Initialize countdown and play audio
  useEffect(() => {
    if (!isInvalidMeeting && callingState !== CallingState.LEFT) {
      router.push("/");
      return;
    }

    updateParticipantStatus();
    audioRef.current?.play();
    setCountdown(59);

    const intervalId = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Redirect to home when countdown ends
  useEffect(() => {
    if (countdown === 0) router.push("/");
  }, [countdown]);

  if (!isInvalidMeeting && callingState !== CallingState.LEFT) return null;

  return (
    <div className="w-full">
      {/* Countdown Timer */}
      <div className="m-5 h-14 flex items-center gap-2">
        <div className="relative w-14 h-14 p-2 flex items-center justify-center">
          <span className="text-meet-black font-roboto text-sm">
            {countdown}
          </span>
          <svg
            className="absolute w-24 h-24 animate-countdown"
            style={{ transform: "rotateY(-180deg) rotateZ(-90deg)" }}
          >
            <circle
              r="18"
              cx="40"
              cy="40"
              strokeDasharray={113}
              strokeDashoffset={0}
              strokeWidth={4}
              stroke="var(--primary)"
              fill="none"
            />
          </svg>
        </div>
        <span className="font-roboto text-sm">Returning to home screen</span>
      </div>

      <div className="mt-6 px-4 flex flex-col items-center gap-8">
        {/* Main message */}
        <h1 className="text-4xl font-normal text-dark-gray">
          {isInvalidMeeting
            ? "Check your meeting code"
            : "You left the meeting"}
        </h1>

        {isInvalidMeeting && (
          <div className="font-roboto text-base text-meet-gray text-center">
            <p>Ensure the meeting code is correct, e.g.:</p>
            <p>
              https://{window.location.host}/
              <span className="font-extrabold">xxx-yyyy-zzz</span>
              <a href="#" className="ml-2 text-primary">
                Learn more
              </a>
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!isInvalidMeeting && (
            <Button
              size={"sm"}
              variant={"secondary"}
              onClick={() => router.push(`/${meetingId}`)}
            >
              Rejoin
            </Button>
          )}
          <Button size="sm" onClick={() => router.push("/")}>
            Return to home screen
          </Button>
        </div>

        {/* Feedback button */}
        <Button size="sm">Submit feedback</Button>

        {/* Security information */}
        <div className="flex flex-col items-center pl-4 pr-3 pt-4 pb-1 border text-left">
          <div className="flex items-center">
            <Image
              alt="Your meeting is safe"
              width={58}
              height={58}
              src="https://www.gstatic.com/meet/security_shield_356739b7c38934eec8fb0c8e93de8543.svg"
            />
            <div className="pl-4">
              <h2 className="text-meet-black text-lg">Your meeting is safe</h2>
              <p className="font-roboto text-sm text-meet-gray">
                Only invited or admitted guests can join.
              </p>
            </div>
          </div>
          <Button variant="ghost" className="mt-2">
            Learn more
          </Button>
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src="https://www.gstatic.com/meet/sounds/leave_call_bfab46cf473a2e5d474c1b71ccf843a1.ogg"
      />
    </div>
  );
};

export default MeetingEnd;
