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
            frameBorder="0"
          ></iframe>
        </main>
      </div>
    </div>
  );
};

export default Page;
