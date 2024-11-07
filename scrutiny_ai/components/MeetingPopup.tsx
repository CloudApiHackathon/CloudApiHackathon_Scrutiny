import Image from "next/image";
import { useEffect } from "react";
import { useCall, useConnectedUser } from "@stream-io/video-react-sdk";
import Clipboard from "./Clipboard";
import PersonAdd from "./icons/PersonAdd";
import Popup from "./Popup";
import useLocalStorage from "../hooks/useLocalStorage";
import { Button } from "./ui/button";

const MeetingPopup = () => {
  const user = useConnectedUser();
  const call = useCall();
  const meetingId = call?.id!;

  const [seen, setSeen] = useLocalStorage(`meetingPopupSeen`, {
    [meetingId]: false,
  });

  const email = user?.custom?.email || user?.name || user?.id;
  const clipboardValue = window.location.href
    .replace("http://", "")
    .replace("https://", "")
    .replace("/meeting", "");

  const onClose = () => {
    setSeen({
      ...seen,
      [meetingId]: true,
    });
  };

  useEffect(() => {
    setSeen({
      ...seen,
      [meetingId]: seen[meetingId] || false,
    });

    const setSeenTrue = () => {
      if (seen[meetingId]) return;
      setSeen({
        ...seen,
        [meetingId]: true,
      });
    };

    return () => {
      setSeenTrue();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Popup
      open={!seen[meetingId]}
      onClose={onClose}
      title={<h2>Your meeting&apos;s ready</h2>}
      className="left-4 bottom-0 -translate-y-22.5 animate-popup"
    >
      <div className="p-6 pt-0">
        <Button size="sm">
          <PersonAdd />
          Add others
        </Button>
        <div className="mt-2 text-dark-gray text-sm font-roboto tracking-looserst">
          Or share this meeting link with others you want in the meeting
        </div>
        <div className="mt-2">
          <Clipboard value={clipboardValue} />
        </div>
        <div className="my-4 flex items-center gap-2">
          <Image
            width={26}
            height={26}
            alt="Your meeting is safe"
            src="https://www.gstatic.com/meet/security_shield_with_background_2f8144e462c57b3e56354926e0cda615.svg"
          />
          <div className="text-xs font-roboto text-meet-gray tracking-wide">
            People who use this meeting link must get your permission before
            they can join.
          </div>
        </div>
        <div className="text-xs font-roboto text-meet-gray tracking-wide">
          Joined as {email}
        </div>
      </div>
    </Popup>
  );
};

export default MeetingPopup;
