/**
 * PostControls.tsx
 * Description - Holds the Validate and Post Buttons
 */
"use client";

import React from "react";
import { PostControlProps } from "@/lib/api/shared/controls/types";
import { SecureButton } from "../SecureButton";
import { Permissions } from "@/app/config/permissions";

export default function PostControls({
  loading,
  onValidate,
  onValidateDisabled,
  onPost,
  onPostDisabled,
}: PostControlProps) {
  return (
    <div className="flex items-center gap-3">
        {/* Validate */}
        <SecureButton
            permission={Permissions.JOURNALPOST_GL}
            onClick={onValidate}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || onValidateDisabled}
        >
            Validate
        </SecureButton>
        {/* Post */}
        <SecureButton
            permission={Permissions.JOURNALPOST_GL}
            onClick={onPost}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || onPostDisabled}
        >
            Post
        </SecureButton>
    </div>
  );
}
