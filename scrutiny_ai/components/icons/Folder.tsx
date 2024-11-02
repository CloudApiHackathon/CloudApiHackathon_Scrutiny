import React from "react";
import clsx from "clsx";
interface FolderProps {
  className?: string;
}

const Folder = ({ className }: FolderProps) => {
  return (
    <span className={clsx("material-symbols-outlined", className)}>folder</span>
  );
};

export default Folder;
