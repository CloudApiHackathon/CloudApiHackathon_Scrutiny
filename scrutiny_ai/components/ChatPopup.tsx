import {
  DefaultStreamChatGenerics,
  MessageInput,
  MessageList,
  Channel,
  Window,
  ChannelHeader,
  Thread,
} from 'stream-chat-react';
import 'stream-chat-react/css/v2/index.css';
import 'stream-chat-react/css/v2/emoji-replacement.css';
import { type Channel as ChannelType } from 'stream-chat';
import { useEffect } from "react";
import Popup from './Popup';

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (isOpen: boolean) => void; // New prop to inform parent about open state
  channel: ChannelType<DefaultStreamChatGenerics>;
}

const ChatPopup = ({ channel, onOpenChange, onClose, isOpen }: ChatPopupProps) => {

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen); // Notify parent when the open state changes
    }
  }, [isOpen, onOpenChange]);

  return (
    <Popup
      open={isOpen}
      onClose={onClose}
      title={<h2>In-call messages</h2>}
      className="bottom-[5rem] right-4 left-auto w-[26%] h-[calc(100svh-6rem)] animate-slideInRight"
    >
      <div className="px-0 pb-3 pt-0 h-[calc(100%-66px)]">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader live={true} title={'General'} />
            <MessageList disableDateSeparator />
            <MessageInput noFiles />
          </Window>
          <Thread />
        </Channel>
      </div>
    </Popup>
  );
};

export default ChatPopup;
