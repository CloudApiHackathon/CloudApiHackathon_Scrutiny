"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { customAlphabet } from "nanoid";
import { useForm } from "react-hook-form";
import Image from "next/image";
import clsx from "clsx";
import { AppContext, MEETING_ID_REGEX } from "@/contexts/AppProvider";
import { API_KEY, CALL_TYPE } from "@/contexts/MeetProvider";
import Header from "@/components/Header";

import Videocall from "@/components/icons/Videocall";
import {
  ErrorFromResponse,
  GetCallResponse,
  StreamVideoClient,
  User,
  
} from "@stream-io/video-react-sdk";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Url from "@/components/icons/Url";
import Plus from "@/components/icons/Plus";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Copy from "@/components/icons/Copy";
import { CalendarIcon, Cross1Icon, ReloadIcon } from "@radix-ui/react-icons";

import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Define schema for form validation
const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  participants: z.array(z.string()),
});

const GUEST_USER: User = { id: "guest", type: "guest" };

const Home = () => {
  const { setNewMeeting } = useContext(AppContext);
  const { user, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [code, setCode] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [checkingCode, setCheckingCode] = useState(false);
  const [isCreatingNewMeeting, setIsCreatingNewMeeting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: undefined,
      participants: [],
    },
  });

  const router = useRouter();

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  useEffect(() => {
    if (!isOpen) {
      setCode("");
    }
  }, [isOpen]);

  // Generate a unique meeting ID
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

  // Create a new meeting
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
      setIsCreatingNewMeeting(true);
      const id = await generateMeetingId();
      if (id) {
        setNewMeeting(true);
        router.push(`/${id}`);
      }
    } catch (e) {
      console.error("Error creating instant meeting:", e);
    } finally {
      setIsCreatingNewMeeting(false);
    }
  };

  const handleLaterMeeting = async () => {
    try {
      setIsCreatingNewMeeting(true);
      const id = await generateMeetingId();
      if (id) {
        setCode(id);
        setIsOpen(true);
      }
    } catch (e) {
      console.error("Error creating later meeting:", e);
    } finally {
      setIsCreatingNewMeeting(false);
    }
  };

  const handleCodeJoin = async () => {
    if (!MEETING_ID_REGEX.test(code)) return;
    setCheckingCode(true);
    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: GUEST_USER,
    });

    const call = client.call(CALL_TYPE, code);
    try {
      const response = await call.get();
      if (response.call) {
        router.push(`/${code}`);
      }
    } catch (e) {
      if (e instanceof ErrorFromResponse && e.status === 404) {
        setError("Couldn't find the meeting you're trying to join.");
      }
    } finally {
      setCheckingCode(false);
    }
  };

  const onSubmit = async (data: { title: string; description: string }) => {
    try {
      console.log("data", data);
      const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 4);
      const id = `${nanoid(3)}-${nanoid(4)}-${nanoid(3)}`;
      setIsCreatingNewMeeting(true);
      await createMeeting(id, data.title, "IDLE", data.description);
      await updateParticipantStatus(id);
      await axios.post(
        "/api/invite",
        {
          title: data.title,
          description: data.description,
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

  return (
    <div>
      <Header />
      <main
        className={clsx(
          "flex flex-col items-center justify-center px-6",
          !isLoading ? "animate-fade-in" : "opacity-0"
        )}
      >
        {/* Main Title and Description */}
        <div className="text-center max-w-2xl px-6 py-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Video Interviews for Developers
          </h1>
          <p className="text-lg text-gray-600">
            Connect with your team and interview candidates remotely
          </p>
        </div>

        {/* Meeting Controls */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-2">
          {user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    {isCreatingNewMeeting ? (
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Videocall /> New meeting
                      </>
                    )}
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

              {/* Code Join Input */}
              <div className="flex items-center gap-2 sm:ml-4">
                <Input
                  name="code"
                  placeholder="Enter a code or link"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <Button onClick={handleCodeJoin} disabled={!code}>
                  Join
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Get Link Illustration */}
        <div className="mt-10 flex flex-col items-center">
          <Image
            src="/assets/home.png"
            alt="Get a link you can share"
            width={400}
            height={400}
            className="max-w-full max-h-full rounded-full"
          />
        </div>

        {/* Dialog for Invitation Link */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Your Invitation Link</DialogTitle>
              <DialogDescription>
                <p>
                  Share this link with your team to schedule a meeting later
                </p>
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

        {/* Dialog for Scheduling a Meeting */}
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
                                newValue
                                  .split(", ")
                                  .map((email) => email.trim())
                              ); // Update field value
                              setEmails(
                                newValue
                                  .split(", ")
                                  .map((email) => email.trim())
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
                  {isCreatingNewMeeting ? (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Schedule Meeting
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Home;
