'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const AgoraUIKit = dynamic(() => import('agora-react-uikit'), { ssr: false });

const VideoCall: React.FC = () => {
  const [videoCall, setVideoCall] = useState(false);

  const rtcProps = {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '',
    channel: process.env.NEXT_PUBLIC_AGORA_CHANNEL || '',
    token: process.env.NEXT_PUBLIC_AGORA_TOKEN || null,
  };

  const callbacks = {
    EndCall: () => setVideoCall(false),
  };

  return videoCall ? (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
    </div>
  ) : (
    <h3 onClick={() => setVideoCall(true)}>Join</h3>
  );
};

export default VideoCall;