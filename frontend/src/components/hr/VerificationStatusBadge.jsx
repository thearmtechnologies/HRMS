import React from "react";
import { Badge } from "flowbite-react";

export default function VerificationStatusBadge({ status }) {
  let color = "gray";
  let text = "Not Submitted";

  if (status === "pending") {
    color = "warning";
    text = "Pending Verification";
  } else if (status === "verified") {
    color = "success";
    text = "Verified";
  } else if (status === "rejected") {
    color = "failure";
    text = "Rejected";
  }

  return (
    <Badge color={color} size="sm" className="w-fit">
      {text}
    </Badge>
  );
}
