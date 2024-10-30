"use client";
import { ReactNode } from "react";
import { useParams } from "next/navigation";
import MeetProvider from "@/contexts/MeetProvider";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { meetingId } = useParams() as { meetingId: string };
  if (!meetingId) return null;
  return <MeetProvider meetingId={meetingId}>{children}</MeetProvider>;
}
