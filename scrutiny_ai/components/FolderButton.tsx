import React from "react";
import clsx from "clsx";


interface FolderButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  isDirectory?: boolean; 
}

const FileButton = ({ onClick, children, className, isDirectory}: FolderButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center justify-start w-full px-4 py-3 text-left text-lg font-medium text-gray-800 rounded-md hover:bg-gray-100",
        className
      )}
    >
      {children}
    </button>
  );
};

export default FileButton;