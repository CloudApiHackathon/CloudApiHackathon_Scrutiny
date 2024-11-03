/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import router from "next/router";
import clsx from "clsx";
import { format } from "date-fns";
import { customAlphabet } from "nanoid";

// Components
import Header from "@/components/Header";
import MeetingCard from "@/components/MeetingCard";
import Spinner from "@/components/Spinner";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import Plus from "@/components/icons/Plus";
import Url from "@/components/icons/Url";
import { CalendarIcon, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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

// Form Schema
const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  participants: z.array(z.string()),
});

const Page = () => {
  const { user, isLoading } = useUser();
  const { setNewMeeting } = useContext(AppContext);

  // State
  const [isMeetingLoading, setIsMeetingLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: undefined,
      participants: [],
    }
  });

  // Functions
  const generateMeetingId = async () => {
    const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 4);
    const id = `${nanoid(3)}-${nanoid(4)}-${nanoid(3)}`;
    try {
      await createMeeting(id, "Instant meeting", "IDLE");
      return id;
    } catch (e) {
      console.error("Error generating meeting ID:", e);
    }
  };

  const createMeeting = async (id: string, title: string, status: string) => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/meetings/`,
      {
        title,
        description: title,
        status,
        nanoid: id,
        date: form.getValues("date") || "",
      },
      {
        headers: { Authorization: `Bearer ${user?.accessToken || ""}` },
      }
    );
  };

  const handleInstantMeeting = async () => {
    const id = await generateMeetingId();
    if (id) {
      setNewMeeting(true);
      router.push(`/${id}`);
    }
  };

  const handleLaterMeeting = async () => {
    const id = await generateMeetingId();
    if (id) {
      setCode(id);
      setIsOpen(true);
    }
  };

  const onSubmit = async (data: { title: any }) => {
    try {
      await createMeeting(
        customAlphabet("abcdefghijklmnopqrstuvwxyz", 4)(),
        data.title,
        "SCHEDULED"
      );
      setIsScheduleOpen(false);
    } catch (e) {
      console.error("Error scheduling meeting:", e);
    }
  };

  // Fetch Meetings
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
        console.error(error);
      } finally {
        setIsMeetingLoading(false);
      }
    };

    fetchParticipants();
  }, [user?.accessToken]);

  // JSX
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
        <div className="flex w-full">
          <div className="flex-grow p-4 bg-white">
            <div className="flex flex-col items-start justify-center h-auto p-6 overflow-y-auto">
              <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                Upcoming Meetings
              </h1>
              <div className="mt-10 w-full h-full flex-1 justify-center items-center">
                {isMeetingLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner />
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    {meetings.map((meeting) => (
                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        className="w-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-1/4 p-4 flex justify-center mt-10">
            <Calendar
            selected={new Date()}
              mode="single"
              style={{
                borderRadius: "1rem",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                height: "fit-content",
              }}
            />
          </div>
        </div>
      </div>

      {/* Dropdown for Meeting Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-4 right-4"
          >
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuItem onClick={handleLaterMeeting}>
            <Url /> Create meeting for later
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleInstantMeeting}>
            <Plus /> Create instant meeting
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsScheduleOpen(true)}>
            <CalendarIcon /> Schedule meeting
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Your Invitation Link</DialogTitle>
            <DialogDescription>
              <p>Share this link with your team to schedule a meeting later</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="p-4 bg-gray-900 text-gray-100 rounded-md font-mono text-sm">
                  {code}
                </div>
                <Button onClick={() => navigator.clipboard.writeText(code)}>
                  <Copy /> Copy
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule your meeting</DialogTitle>
            <DialogDescription>
              Fill in the details below to schedule your meeting
            </DialogDescription>
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="An upcoming interview" {...field} />
                      </FormControl>
                      <FormDescription>Enter a title</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Meeting description" {...field} />
                      </FormControl>
                      <FormDescription>Enter a description</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={clsx(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? format(field.value, "PPP")
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Schedule meeting
                </Button>
              </form>
            </FormProvider>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
