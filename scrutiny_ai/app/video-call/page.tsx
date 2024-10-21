import dynamic from 'next/dynamic';
import { useState } from 'react';
import Image from 'next/image';

const VideoCall = dynamic(() => import('../../components/VideoCall'), { ssr: false });

export default function VideoCallPage() {
  const [isCallStarted, setIsCallStarted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Video Call</h1>
      
      {!isCallStarted ? (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <Image
            src="/video-call-icon.svg"
            alt="Video Call Icon"
            width={100}
            height={100}
            className="mx-auto mb-6"
          />
          <p className="text-center text-gray-600 mb-6">
            Start a video call with your team members or clients.
          </p>
          <button
            onClick={() => setIsCallStarted(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Start Video Call
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <VideoCall />
          <button
            onClick={() => setIsCallStarted(false)}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
}