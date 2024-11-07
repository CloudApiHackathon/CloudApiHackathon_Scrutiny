/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Header from "@/components/Header";
import { useUser } from "@auth0/nextjs-auth0/client";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import {
  RadarChart,
  Radar,
  Tooltip,
  Legend,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import Review from "@/components/icons/Review";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Spinner from "@/components/Spinner";

// Configuration for the RadarChart colors and labels
const chartConfig = {
  desktop: {
    label: "User",
    color: "#2563eb",
  },
  mobile: {
    label: "Average participants",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

// Sample chart data for RadarChart
const chartData = [
  { subject: "Math", A: 120, B: 110 },
  { subject: "Chinese", A: 98, B: 130 },
  { subject: "English", A: 86, B: 130 },
  { subject: "Geography", A: 99, B: 100 },
  { subject: "Physics", A: 85, B: 90 },
  { subject: "History", A: 65, B: 85 },
] as const;

// Leaderboard data for users with a specific role
const leaderboard = [
  { participantId: "001", score: 120, note: "Excellent" },
  { participantId: "002", score: 110, note: "Good" },
  { participantId: "003", score: 100, note: "Average" },
  { participantId: "004", score: 90, note: "Below Average" },
  { participantId: "005", score: 80, note: "Poor" },
] as const;

const Page = () => {
  const [result, setResult] = useState([...chartData]);
  const [isFetching, setIsFetching] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Fetch user role data if user is available
    const fetchData = async () => {
      if (!user) return;
      try {
        setIsFetching(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        );
        setRole(response.data.role);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [user]);

  if (role !== "USER") {
    return (
      <div
        className={clsx(
          "flex flex-col min-h-screen w-full p-5",
          !isLoading ? "animate-fade-in" : "opacity-0"
        )}
      >
        <Header isSidebarOpen={true} />
        <div className="flex flex-col items-center justify-center bg-white w-full h-screen">
          <h1 className="text-3xl font-bold text-gray-800">Your Results</h1>
          <p className="text-lg text-gray-600 mt-2">
            Your personalized results and feedback.
          </p>

          {isFetching ? (
            <Spinner />
          ) : (
            <div className="w-full flex flex-col items-center justify-center mt-10 px-4">
              <div className="w-full max-w-3xl flex flex-col md:flex-row items-stretch justify-between gap-6">
                {/* Feedback Section */}
                <div className="flex-2 p-6 bg-white rounded-lg shadow-md border border-gray-200 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Review className="w-6 h-6 text-gray-800" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Feedback
                    </h2>
                  </div>
                  <p className="text-gray-600">
                    This section contains valuable feedback based on your
                    interview results.
                  </p>
                </div>

                {/* Chart Section */}
                <div className="flex-1 w-full md:w-auto h-full">
                  <ChartContainer
                    config={chartConfig}
                    className="min-h-[250px] w-full bg-white rounded-lg p-6 shadow-md border border-gray-200 h-full"
                  >
                    <RadarChart
                      aria-label="Interview Results Comparison"
                      data={result}
                      className="m-auto"
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar
                        name="You"
                        dataKey="A"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Average participants"
                        dataKey="B"
                        stroke="#60a5fa"
                        fill="#60a5fa"
                        fillOpacity={0.6}
                      />
                      {/* Tooltip for hover info */}
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div
        className={clsx(
          "flex flex-col min-h-screen w-full",
          !isLoading ? "animate-fade-in" : "opacity-0"
        )}
      >
        <Header isSidebarOpen={true} />
        <div className="flex flex-col items-center justify-center bg-white w-full h-screen">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">
            View and manage participant performance and feedback insights.
          </p>

          {isFetching ? (
            <Spinner />
          ) : (
            <div className="w-full flex flex-col items-center justify-center mt-10 px-4">
              <Table className="p-6">
                <TableCaption>Leaderboard</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Participant ID</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((participant) => (
                    <TableRow key={participant.participantId}>
                      <TableCell className="font-medium">
                        {participant.participantId}
                      </TableCell>
                      <TableCell>{participant.score}</TableCell>
                      <TableCell className="text-right">
                        {participant.note}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default Page;
