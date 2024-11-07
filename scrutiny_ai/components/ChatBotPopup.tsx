import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Popup from "./Popup";
import Spinner from "./Spinner";

interface ChatBotPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (isOpen: boolean) => void;
}

const ChatBotPopup = ({
  isOpen,
  onClose,
  onOpenChange,
}: ChatBotPopupProps) => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const hasCreatedPaperRef = useRef(false);
  const hasRequestedAccessRef = useRef(false);

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }

    if (isOpen && !hasCreatedPaperRef.current) {
      createPaper();
    }
  }, [isOpen, onOpenChange]);

  const createPaper = async () => {
    try {
      console.log("Creating paper...", process.env.NEXT_PUBLIC_WHITE_BOARD_API);
      hasCreatedPaperRef.current = true; // Set the ref to prevent further calls
      const response = await fetch("https://api.pixelpaper.io/api/paper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHITE_BOARD_API}`,
        },
        body: JSON.stringify({ name: "My First PixelPaper" }),
      });

      if (response.ok) {
        const data = await response.json();
        setIdentifier(data.identifier);
        if (!hasRequestedAccessRef.current) {
          await requestAccessToken(data.identifier);
        }
      } else {
        console.error("Failed to create paper:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating paper:", error);
    }
  };

  const requestAccessToken = async (identifier: string) => {
    try {
      console.log("Requesting access token...", identifier);
      const response = await fetch(
        `https://api.pixelpaper.io/api/access-token/${identifier}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHITE_BOARD_API}`,
          },
          body: JSON.stringify({ name: "James Smith" }),
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          // Read the response as JSON if the content type is JSON
          const data = await response.json();
          console.log("Access token data:", data);
          if (data.token) {
            setAccessToken(data.token);
          } else {
            console.error("Unexpected JSON response format:", data);
          }
        } else {
          // Read the response as plain text if it's not JSON
          const token = await response.text();
          console.log("Access token (plain text):", token);
          setAccessToken(token);
        }
      } else {
        console.error("Failed to request access token:", response.statusText);
      }
    } catch (error) {
      console.error("Error requesting access token:", error);
    }
  };

  return (
    <Popup
      open={isOpen}
      onClose={onClose}
      title={<h2>ChatBot</h2>}
      className="bottom-[5rem] right-4 left-auto w-[26%] h-[calc(100svh-6rem)] animate-slideInRight"
    >
      <div className="px-4 pb-3 pt-0 h-[calc(100%-66px)]">
        {identifier && accessToken ? (
            <iframe
            src="https://www.chatbase.co/chatbot-iframe/H_ZbIk_whzGruNmqxue3y"
            width="100%"
            style={{ height: '80%', minHeight: '625px' }}
            ></iframe>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>
    </Popup>
  );
};

export default ChatBotPopup;
