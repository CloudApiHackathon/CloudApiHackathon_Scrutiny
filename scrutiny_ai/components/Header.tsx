"use client";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import clsx from "clsx";
import PlainButton from "./PlainButton";
import useTime from "../hooks/useTime";
import UserButton from "./UserButton";
import { useRouter } from "next/navigation";
import IconButton from "./IconButton";
import Settings from "./icons/Settings";
import Notification from "./icons/Notification";
import { getSupabase } from "@/utils/supabase";
import NotificationActive from "./icons/NotificationActive";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

interface HeaderProps {
  navItems?: boolean;
}

const Header = ({ navItems = true }: HeaderProps) => {
  const { isLoading, user } = useUser();
  const { currentDateTime } = useTime();
  const [notification, setNotification] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (user) {
      const supabase = getSupabase(user.accessToken as string);
      const fetchUserMeeting = async () => {
        const { data: userData, error: userError } = await supabase
          .from("user")
          .select("userId")
          .eq("tokenIdentifier", user.sub)
          .single();

        if (userError || !userData) {
          console.error("Error fetching user:", userError);
          return;
        }

        const userId = userData.userId;

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
            (payload) => {
              const {
                eventType,
                new: newParticipant,
                old: oldParticipant,
              } = payload;
              setHasNewNotifications(true);
              console.log("Participant Subscription", {
                eventType,
                newParticipant,
                oldParticipant,
              });
            }
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
            (payload) => {
              const { eventType, new: newMeeting, old: oldMeeting } = payload;
              setHasNewNotifications(true);
              console.log("Meeting Subscription", {
                eventType,
                newMeeting,
                oldMeeting,
              });
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(meetingSubscription);
          supabase.removeChannel(participantsSubscription);
        };
      };
      fetchUserMeeting();
    }
  }, [user]);

  return (
    <header className="w-full px-4 pt-4 flex items-center justify-between bg-white">
      <div className="w-60 max-w-full flex items-center cursor-default">
        <a href="/#" className="flex items-center w-full">
          <div className="font-product-sans text-2xl leading-6 text-meet-gray select-none">
            <span className="font-medium">Scrunity </span>
          </div>
        </a>
        <PlainButton
          size="sm"
          className="text-lg leading-4.5 text-meet-gray"
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          Dashboard
        </PlainButton>
      </div>
      <div className="flex items-center cursor-default">
        {navItems && (
          <>
            <div className="hidden md:block mr-2 text-lg leading-4.5 text-meet-gray select-none">
              {currentDateTime}
            </div>
            <div className="hidden sm:contents [&>button]:mx-2.5">
              <IconButton title="Settings" icon={<Settings />} />
            </div>
            <div className="hidden sm:contents [&>button]:mx-2.5 relative">
              {hasNewNotifications ? (
                <IconButton
                  className="relative h-8 w-8 rounded-full"
                  title="Settings"
                  icon={<NotificationActive />}
                  onClick={() => {
                    setHasNewNotifications(false);
                  }}
                />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconButton
                      className="relative h-8 w-8 rounded-full"
                      title="Settings"
                      icon={<Notification />}
                      onClick={() => {
                        setHasNewNotifications(false);
                      }}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex gap-3">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Notifications
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem>
                      <a
                        href="/notifications"
                        className="flex gap-2 items-center"
                      >
                        <Notification />
                        View All
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </>
        )}
        <div className=" flex items-center justify-end w-[6.5625rem] lg:ml-5">
          <div
            className={clsx(
              "w-[3.04rem] grow flex items-center justify-end [&_img]:w-9 [&_span]:w-9 [&_img]:h-9 [&_span]:h-9",
              !isLoading ? "animate-fade-in" : "opacity-0"
            )}
          >
            {user ? (
              <>
                <div className="relative h-9">
                  <UserButton user={user} />
                </div>
              </>
            ) : (
              <PlainButton
                size="sm"
                onClick={() => {
                  router.push("/api/auth/login");
                }}
              >
                Sign In
              </PlainButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
