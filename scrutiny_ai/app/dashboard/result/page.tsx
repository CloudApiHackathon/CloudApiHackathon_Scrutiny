"use client";
import Header from "@/components/Header";
import { useUser } from "@auth0/nextjs-auth0/client";
import clsx from "clsx";
import React, { useEffect, useState, useRef } from "react";

const Page = () => {
  const [result, setResult] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const { user, isLoading } = useUser();
  useEffect(() => {}, []);

  return (
    <div
      className={clsx(
        "flex flex-col min-h-screen w-full",
        !isLoading ? "animate-fade-in" : "opacity-0"
      )}
    >
      <Header isSidebarOpen={true} />
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white w-full h-screen">
        <h1 className="text-3xl font-bold text-gray-800">Result</h1>
        <p className="text-gray-600 mt-4">
          Here are the results of the interview. You can view the results and
          feedback below.
        </p>
        <div className="w-20 h-20 mt-10"></div>
        <a
          href="/"
          className="mt-4 text-blue-500 hover:bg-blue-100 p-1 rounded"
        >
          Go back to home
        </a>
      </div>
    </div>
  );
};

export default Page;
