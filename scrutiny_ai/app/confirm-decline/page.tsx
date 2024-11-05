"use client";
import React from "react";
import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";

const Page = () => {
  const animationContainer = useRef(null);

  useEffect(() => {
    let animationInstance: AnimationItem | undefined;

    if (animationContainer.current) {
      animationInstance = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: "svg",
        loop: false,
        autoplay: true,
        path: "/animation/decline.json",
      });
    }

    // Cleanup function to stop and destroy the animation instance on unmount
    return () => {
      if (animationInstance) {
        animationInstance.stop();
        animationInstance.destroy();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white w-full h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Decline Confirm</h1>
      <p className="text-gray-600 mt-4">
        You have successfully declined the invitation. Hope to see you soon!
      </p>
      <div className="w-20 h-20 mt-10" ref={animationContainer}></div>
      <a href="/" className="mt-4 text-blue-500 hover:bg-blue-100 p-1 rounded">
        Go back to home
      </a>
    </div>
  );
};

export default Page;
