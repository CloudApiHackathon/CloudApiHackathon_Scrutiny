import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  inviteLink: string;
  meeting: {
    title: string;
    date: string;
  };
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  inviteLink,
  meeting,
}) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
    <p>
      You have been invited to join a meeting titled &quot;{meeting.title}&quot;
      on {meeting.date}.
    </p>
    <p>
      Please click <a href={inviteLink}>here</a> to confirm your participant.
    </p>
  </div>
);
