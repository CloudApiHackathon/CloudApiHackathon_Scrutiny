"use client";
<<<<<<< HEAD
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import clsx from "clsx";
=======
import { AppContext, MEETING_ID_REGEX } from "@/contexts/AppProvider";
import { API_KEY, CALL_TYPE } from "@/contexts/MeetProvider";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  ErrorFromResponse,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useContext } from "react";
>>>>>>> 8355ab9 (temporary assume that bucket is public)
import { CalendarIcon } from "@radix-ui/react-icons";

interface Meeting {
  occurred_at: string;
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  nanoid: string;
}

const MeetingCard = ({
  meeting,
  className,
  handleOnClick,
}: {
  meeting: Meeting;
  className?: string;
  handleOnClick?: (meeting: Meeting) => void;
}) => {
  const meetingCardBackground = () => {
    switch (meeting.status) {
      case "END":
        return "bg-red-100";
      case "LIVE":
        return "bg-green-100";
      case "IDLE":
        return "bg-yellow-100";
      default:
        return "bg-blue-100";
    }
  };

  return (
    <Card
      className={clsx(
        "shadow-lg rounded-xl p-6 text-gray-700 transition-all duration-300 ease-in-out transform hover:scale-103 bg-white shadow-lg rounded-xl p-4 text-gray-700 shadow-blue-gray-900/5 hidden sm:block  hover:shadow-xl",
        className,
        meetingCardBackground()
      )}
<<<<<<< HEAD
      onClick={() => handleOnClick && handleOnClick(meeting)}
=======
      onClick={() => handleCodeJoin(meeting.nanoid)}
>>>>>>> 8355ab9 (temporary assume that bucket is public)
    >
      <CardHeader className="pb-4 mb-2 flex flex-row items-center justify-between">
        <CardTitle>{meeting.title}</CardTitle>
        <span
          className={clsx(
            "relative text-xs font-medium px-2 py-1 rounded-full flex items-center",
            meeting.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-500"
          )}
        >
          {meeting.status === "LIVE" && (
            <span className="relative mr-1 flex items-center">
              <span className="absolute inline-block w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            </span>
          )}
          {meeting.status}
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {meeting.description && (
          <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500 ml-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-tight text-gray-500">
                {meeting.description}
              </h4>
            </div>
          </div>
        )}
        <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 items-center">
          <CalendarIcon className="mr-1 h-3 w-3 text-gray-500" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-tight text-gray-500">
<<<<<<< HEAD
              {new Date(
                meeting.occurred_at ?? meeting.created_at
              ).toLocaleString("en-US", {
=======
              {new Date(meeting.created_at).toLocaleString("en-US", {
>>>>>>> 8355ab9 (temporary assume that bucket is public)
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZoneName: "short",
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingCard;
