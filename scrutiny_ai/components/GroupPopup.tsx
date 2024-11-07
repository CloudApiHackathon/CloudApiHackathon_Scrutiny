import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Popup from './Popup';
import EditNote from './icons/EditNote';
import Robot from './icons/Robot';
import Code from './icons/Code';

interface GroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (isOpen: boolean) => void; }

const GroupPopup = ({ isOpen, onClose, onOpenChange }: GroupPopupProps) => {
  const router = useRouter(); // Initialize useRouter
};

export default GroupPopup;
