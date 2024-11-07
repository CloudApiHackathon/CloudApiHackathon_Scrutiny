"use client";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, ReactNode } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { BellIcon, CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface Meeting {
  occurred_at: string | number | Date;
  description: ReactNode;
  created_at: string | number | Date;
  id: string;
  title: string;
}

const Page = () => {
  const [isFetchingMeeting, setIsFetchingMeeting] = useState(false);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [isUpdatingParticipant, setIsUpdatingParticipant] = useState(false);
  const [isInvalidInvite, setIsInvalidInvite] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("code");

  const handleUpdateParticipant = async (meetingId: string, status: string) => {
    if (!user || !token) return;
    try {
      setIsUpdatingParticipant(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/invite-participant`,
        {
          meetingId,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
      if (status === "ACCEPT") {
        router.push(`/confirm-accept`);
      }
      if (status === "DECLINE") {
        router.push("/confirm-decline");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to update participant status. Please try again.");
    } finally {
      setIsUpdatingParticipant(false);
    }
  };

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        if (!user || !token) return;
        setIsFetchingMeeting(true);
        const {
          data: { participant, meetingId },
        } = await axios.post(
          `/api/validate-participant`,
          {
            inviteCode: token,
          },
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        );
        if (!participant || !meetingId) {
          setIsInvalidInvite(true);
          setIsFetchingMeeting(false);
          return;
        }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/meetings?nanoid=${meetingId}`,
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        );
        setMeeting(response.data);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Failed to fetch meeting information. Please try again."
        );
      } finally {
        setIsFetchingMeeting(false);
      }
    };

    // Fetch the meeting information only if the user is loaded and the token is present
    if (!isLoading) {
      fetchMeeting();
    }
  }, [user, token, isLoading]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white w-full h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Confirm Invite</h1>
      <p className="mt-2 text-gray-600 text-lg">
        You have been invited to a meeting.
      </p>

      {isLoading ? (
        <p className="text-gray-500 flashing-text">
          Loading user information...
        </p>
      ) : isFetchingMeeting ? (
        <p className="text-gray-500 flashing-text">
          Loading meeting information...
        </p>
      ) : isInvalidInvite ? (
        <p className="text-red-500">
          Invalid invite link. Please check your email.
        </p>
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : meeting ? (
        <div className="mt-2">
          <Card className={cn("w-[380px]", "")}>
            <CardHeader>
              <CardTitle>Meeting Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className=" flex items-center space-x-4 rounded-md border p-4">
                <BellIcon />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Notification
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to device
                  </p>
                </div>
                <Switch />
              </div>
              <div>
                <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500 ml-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-tight text-gray-500">
                      {meeting.title}
                    </h4>
                  </div>
                </div>
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
                      {new Date(meeting.occurred_at ?? meeting.created_at).toLocaleString("en-US", {
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
              </div>
            </CardContent>
            <CardFooter>
              <div className="mt-4 flex space-x-4">
                <Button
                  disabled={
                    isFetchingMeeting ||
                    isUpdatingParticipant ||
                    isInvalidInvite
                  }
                  onClick={() =>
                    meeting?.id && handleUpdateParticipant(meeting.id, "ACCEPT")
                  }
                >
                  Accept
                </Button>
                <Button
                  disabled={
                    isFetchingMeeting ||
                    isUpdatingParticipant ||
                    isInvalidInvite
                  }
                  variant={"secondary"}
                  onClick={() =>
                    meeting?.id &&
                    handleUpdateParticipant(meeting.id, "DECLINE")
                  }
                >
                  Decline
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <p className="text-red-500">Meeting information not found.</p>
      )}
    </div>
  );
};

export default Page;
