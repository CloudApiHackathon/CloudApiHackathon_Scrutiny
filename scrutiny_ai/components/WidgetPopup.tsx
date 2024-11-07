import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Popup from './Popup';
import EditNote from './icons/EditNote';
import Robot from './icons/Robot';
import Code from './icons/Code';
import WhiteboardPopup from "./WhiteBoardPopup";
import ChatBotPopup from "./ChatBotPopup";

interface WidgetPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (isOpen: boolean) => void; // New prop to inform parent about open state
  setIsCodeEditorOpen: (isOpen: boolean) => void;
}

const WidgetPopup = ({ isOpen, onClose, onOpenChange, setIsCodeEditorOpen }: WidgetPopupProps) => {
  const router = useRouter();
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false); // State for WhiteboardPopup
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State for ChatbotPopup

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  const handleItemClick = (action: string) => {
    switch (action) {
      case 'Whiteboard':
        setIsWhiteboardOpen(true); // Open WhiteboardPopup
        break;
      case 'Chatbot':
        setIsChatbotOpen(true); // Open ChatbotPopup
        break;
      case 'Code':
        onClose();
        setIsCodeEditorOpen(true);
        break;
      default:
        console.log('No action defined.');
    }
  };

  const items = [
    {
      icon: <EditNote />,
      title: 'Whiteboard',
      description: 'Note everything down',
      action: 'Whiteboard',
    },
    {
      icon: <Robot />,
      title: 'Chatbot',
      description: 'Ask chatbot questions',
      action: 'Chatbot',
    },
    {
      icon: <Code />,
      title: 'Code',
      description: 'Code makes you smart',
      action: 'Code',
    },
  ];

  return (
    <>
      <Popup
        open={isOpen}
        onClose={onClose}
        title={<h2>Widget</h2>}
        className="bottom-[5rem] right-4 left-auto w-[26%] h-[calc(100svh-6rem)] animate-slideInRight"
      >
        <div className="px-4 pb-3 pt-0 h-[calc(100%-66px)]">
          <ul className="space-y-3">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item.action)}
                className="flex items-center space-x-4 bg-white hover:bg-gray-100 p-3 rounded-lg shadow-md w-full text-left transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </button>
            ))}
          </ul>
        </div>
      </Popup>

      {/* Render WhiteboardPopup conditionally */}
      {isWhiteboardOpen && (
        <WhiteboardPopup
          isOpen={isWhiteboardOpen}
          onClose={() => setIsWhiteboardOpen(false)}
          onOpenChange={(state) => setIsWhiteboardOpen(state)}
        />
      )}
      {isChatbotOpen && (
        <ChatBotPopup
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          onOpenChange={(state) => setIsChatbotOpen(state)}
        />
      )}
    </>
  );
};

export default WidgetPopup;
