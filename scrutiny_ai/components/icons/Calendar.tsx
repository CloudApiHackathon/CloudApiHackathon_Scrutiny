import React from "react";
import clsx from "clsx";

interface CalendarProps {
  className?: string;
}

const Calendar = ({ className }: CalendarProps) => {
  return (
    <span className={clsx("material-symbols-outlined", className)}>
      calendar_today
    </span>
  );
};

export default Calendar;
