import Image from "next/image";
import { useEffect } from "react";
import { useCall, useConnectedUser } from "@stream-io/video-react-sdk";

import Clipboard from "./Clipboard";
import PersonAdd from "./icons/PersonAdd";
import Popup from "./Popup";
import { Button } from "./ui/button";
// Removed useLocalStorage import as it's not needed
// import useLocalStorage from '../hooks/useLocalStorage';

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (isOpen: boolean) => void; // Optional, if needed
}

const InfoPopup = ({ isOpen, onClose, onOpenChange }: InfoPopupProps) => {
  const user = useConnectedUser();
  const call = useCall();
  const InfoId = call?.id!;

  const email = user?.custom?.email || user?.name || user?.id;
  const clipboardValue =
    typeof window !== "undefined"
      ? window.location.href
          .replace("http://", "")
          .replace("https://", "")
          .replace("/Info", "")
      : "";

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen); // Notify parent when the open state changes
    }
    // No need to manage 'seen' state here
  }, [isOpen, onOpenChange]);

  return (
    <Popup
      open={isOpen} // Use the isOpen prop from the parent
      onClose={onClose}
      title={<h2>Your Info&apos;s ready</h2>}
      className="bottom-[5rem] right-4 left-auto w-[26%] h-[calc(100svh-6rem)] animate-slideInRight"
    >
      <div className="px-4 pb-3 pt-0 h-[calc(100%-66px)]">
        <Button size="sm">
          <PersonAdd />
          Add others
        </Button>
        <div className="mt-2 text-dark-gray text-sm font-roboto tracking-looserst">
          Or share this Info link with others you want in the Info
        </div>
        <div className="mt-2">
          <Clipboard value={clipboardValue} />
        </div>
        <div className="my-4 flex items-center gap-2">
          <Image
            width={26}
            height={26}
            alt="Your Info is safe"
            src="https://www.gstatic.com/meet/security_shield_with_background_2f8144e462c57b3e56354926e0cda615.svg"
          />
          <div className="text-xs font-roboto text-meet-gray tracking-wide">
            People who use this Info link must get your permission before they
            can join.
          </div>
        </div>
        <div className="text-xs font-roboto text-meet-gray tracking-wide">
          Joined as {email}
        </div>
      </div>
    </Popup>
  );
};

export default InfoPopup;
