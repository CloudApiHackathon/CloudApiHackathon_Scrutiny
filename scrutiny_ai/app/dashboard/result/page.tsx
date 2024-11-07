/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useForm } from "react-hook-form";
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
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Contexts
import { AppContext } from "@/contexts/AppProvider";
import { Badge } from "@/components/ui/badge";
import { Cross1Icon, ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

// Interfaces
interface Meeting {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  nanoid: string;
  occurred_at: string;
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
  const router = useRouter();

  // State
  const [isMeetingLoading, setIsMeetingLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingNewMeeting, setIsCreatingNewMeeting] = useState(false);
  const [code, setCode] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [emails, setEmails] = useState<string[]>([]);

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: undefined,
      participants: [],
    },
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

  const createMeeting = async (
    id: string,
    title: string,
    status: string,
    description?: string
  ) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/meetings/`,
        {
          title,
          description: description || "",
          status,
          nanoid: id,
          occurred_at: form.getValues("date") || "",
        },
        {
          headers: { Authorization: `Bearer ${user?.accessToken || ""}` },
        }
      );
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const updateParticipantStatus = async (meetingId: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/participants/${meetingId}`,
        {
          status: "STAND_BY",
        },
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken || ""}`,
          },
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (emailToDelete: string) => {
    setEmails((prevEmails) =>
      prevEmails.filter((email) => email !== emailToDelete)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      const newEmail = e.currentTarget.value.trim();
      if (newEmail && !emails.includes(newEmail)) {
        setEmails((prevEmails) => [...prevEmails, newEmail]);
        e.currentTarget.value = ""; // Clear input after adding
      }
    }
  };

  const handleInstantMeeting = async () => {
    try {
      const id = await generateMeetingId();
      if (id) {
        setNewMeeting(true);
        router.push(`/${id}`);
      }
    } catch (e) {
      console.error("Error creating instant meeting:", e);
    } finally {
      setNewMeeting(false);
    }
  };

  const handleLaterMeeting = async () => {
    const id = await generateMeetingId();
    if (id) {
      setCode(id);
      setIsOpen(true);
    }
  };

  const onSubmit = async (data: { title: string }) => {
    try {
      const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 4);
      const id = `${nanoid(3)}-${nanoid(4)}-${nanoid(3)}`;
      setIsCreatingNewMeeting(true);
      await createMeeting(id, data.title, "IDLE");
      await updateParticipantStatus(id);
      await axios.post(
        "/api/invite",
        {
          title: data.title,
          date: form.getValues("date"),
          participants: emails,
          meetingId: id,
        },
        {
          headers: { Authorization: `Bearer ${user?.accessToken || ""}` },
        }
      );
      setIsScheduleOpen(false);
    } catch (e) {
      console.error("Error scheduling meeting:", e);
    } finally {
      form.reset();
      setEmails([]);
      setIsCreatingNewMeeting(false);
    }
  };

  const handleOnClick = (meeting: Meeting) => {
    router.push(`/dashboard/result/${meeting.id}`);
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
                Result
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
                        handleOnClick={handleOnClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown for Meeting Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="fixed bottom-4 right-4">
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
          <DropdownMenuSeparator />
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
              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input type="text" placeholder="Email" value={code} />
                  <Button onClick={() => navigator.clipboard.writeText(code)}>
                    <Copy /> Copy
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>
              Set up a meeting in advance and invite participants
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Meeting title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Meeting description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-3">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left"
                          >
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                            <CalendarIcon className="ml-auto opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select a future date for the meeting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="participants"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-3">
                    <FormLabel>Participants</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {emails.map((email, index) => (
                          <Badge
                            key={index}
                            onClick={() => handleDelete(email)}
                          >
                            {email} <Cross1Icon className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                        <Input
                          placeholder="Email addresses"
                          {...field}
                          value={field.value.join(", ")}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            field.onChange(
                              newValue.split(", ").map((email) => email.trim())
                            ); // Update field value
                            setEmails(
                              newValue.split(", ").map((email) => email.trim())
                            ); // Update emails state
                          }}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Separate multiple email addresses with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-4">
                {isCreatingNewMeeting ?? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  </>
                )}
                Schedule Meeting
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
