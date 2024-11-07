/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import clsx from "clsx";
import useTime from "../hooks/useTime";
import UserButton from "./UserButton";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Settings from "./icons/Settings";
import Notification from "./icons/Notification";
import { getSupabase } from "@/utils/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Mail from "./icons/Mail";

interface HeaderProps {
  navItems?: boolean;
  isSidebarOpen?: boolean;
}

interface Notification {
  type: string;
  content: string;
}

const Header = ({ navItems = true, isSidebarOpen = false }: HeaderProps) => {
  const { isLoading, user } = useUser();
  const router = useRouter();
  const { currentDateTime } = useTime();
  const [notification, setNotification] = useState<Notification[]>([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const isInitialized = useRef(false); // Track if initialized to prevent duplicate subscriptions

  useEffect(() => {
    if (!user || isInitialized.current) return;

    const supabase = getSupabase(user.accessToken as string);

    const fetchUserMeeting = async () => {
      isInitialized.current = true; // Prevent re-initialization

      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("id")
        .eq("tokenIdentifier", user.sub)
        .single();

      if (userError || !userData) {
        console.error("Error fetching user:", userError);
        return;
      }

      const userId = userData.id;

      const handleParticipantEvent = (payload: any) => {
        setHasNewNotifications(true);

        const { eventType } = payload;
        let content = "";
        switch (eventType) {
          case "INSERT":
            content = "You have been added to a meeting";
            break;
          case "UPDATE":
            content = `Your participant's status has been updated to ${payload.new.status}`;
            break;
          case "DELETE":
            content = "You have been removed from a meeting";
            break;
        }

        if (content) {
          setNotification((prev) => {
            const updatedStack = [
              { type: "participant", content },
              ...prev,
            ].slice(0, 5); // Keep only the latest 5 notifications
            return updatedStack;
          });
        }
      };

      const handleMeetingEvent = (payload: any) => {
        setHasNewNotifications(true);

        const { eventType } = payload;
        let content = "";
        switch (eventType) {
          case "INSERT":
            content = "A new meeting has been scheduled for you";
            break;
          case "UPDATE":
            content = `Meeting details have been updated ${payload.new.status}`;
            break;
          case "DELETE":
            content = "A meeting has been canceled";
            break;
        }

        if (content) {
          setNotification((prev) => {
            const updatedStack = [{ type: "meeting", content }, ...prev].slice(
              0,
              5
            ); // Keep only the latest 5 notifications
            return updatedStack;
          });
        }
      };

      const participantsSubscription = supabase
        .channel("realtime:user_participants")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "participant",
            filter: `userId=eq.${userId}`,
          },
          handleParticipantEvent
        )
        .subscribe();

      const meetingSubscription = supabase
        .channel("realtime:user_meetings")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "meeting",
            filter: `participants.userId=eq.${userId}`,
          },
          handleMeetingEvent
        )
        .subscribe();

      return () => {
        supabase.removeChannel(participantsSubscription);
        supabase.removeChannel(meetingSubscription);
      };
    };

    fetchUserMeeting();
  }, [user]);

  return (
    <header className="w-full px-4 pt-4 flex items-center justify-between bg-white">
      <div className="w-60 max-w-full flex items-center cursor-default">
        {!isSidebarOpen && (
          <>
            <a href="/#" className="flex items-center w-50 mr-5">
              <div className="font-product-sans text-2xl leading-6 text-meet-gray select-none">
                <span className="font-medium">Scrunity </span>
              </div>
            </a>
            <Button
              variant={"ghost"}
              size="sm"
              onClick={() => {
                router.push("/dashboard");
              }}
            >
              Dashboard
            </Button>
            <Button
              variant={"ghost"}
              size="sm"
              onClick={() => {
                router.push("/hrchat");
              }}
            >
              HR Chat
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center cursor-default">
        {navItems && (
          <>
            <div className="hidden md:flex items-center mr-4 text-lg font-medium text-gray-600 select-none">
              {currentDateTime}
            </div>
            <div className="hidden sm:contents [&>button]:mx-2.5">
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Settings />
              </Button>
            </div>
            <div className="hidden sm:contents [&>button]:mx-2.5 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                    onClick={() => {
                      if (hasNewNotifications) {
                        setHasNewNotifications(false); // Hide the red dot
                      }
                    }}
                  >
                    <div className="relative">
                      <Notification />
                      {hasNewNotifications && (
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem>
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  </DropdownMenuItem>
                  {notification.map((item, index) => (
                    <DropdownMenuItem key={index}>
                      <div className="flex items-center space-x-2">
                        <Mail />
                        <span>{item.content}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
        {!isSidebarOpen && (
          <div className=" flex items-center justify-end w-[2.5625rem] lg:ml-5">
            <div
              className={clsx(
                "w-[3.04rem] grow flex items-center justify-end [&_img]:w-9 [&_span]:w-9 [&_img]:h-9 [&_span]:h-9",
                !isLoading ? "animate-fade-in" : "opacity-0"
              )}
            >
              {user ? (
                <div className="relative h-9">
                  <UserButton user={user} />
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    router.push("/api/auth/login");
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
