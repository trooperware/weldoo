"use client";

import { useState } from "react";

import {
  Button,
  Dropdown,
  EmptyState,
  FormError,
  IconButton,
  LoadingState,
  Modal,
  Tabs,
} from "@/components/ui";

function DotsIcon() {
  return <span className="text-lg leading-none">...</span>;
}

export function StyleGuideExamples() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-weldoo-lg border border-weldoo-border-light bg-white p-6 shadow-weldoo-md">
        <h2 className="text-lg font-semibold">Interactive components</h2>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Dropdown
            items={[
              { label: "View profile" },
              { label: "Save for later" },
              { label: "Report content" },
            ]}
            label="Actions"
          />
          <IconButton icon={<DotsIcon />} label="More actions" />
        </div>

        <div className="mt-8">
          <Tabs
            items={[
              {
                content:
                  "Profile information, welding processes, certifications, and availability.",
                id: "profile",
                label: "Profile",
              },
              {
                content:
                  "Posts, comments, saved content, and professional activity.",
                id: "activity",
                label: "Activity",
              },
              {
                content:
                  "Connections, contact requests, and company interactions.",
                id: "network",
                label: "Network",
              },
            ]}
          />
        </div>

        <Modal
          description="This is the base modal pattern for confirmations and edit flows."
          onOpenChange={setModalOpen}
          open={modalOpen}
          title="Confirm action"
        >
          <p className="text-sm leading-6 text-weldoo-muted">
            Modal content should stay focused, accessible, and easy to close.
          </p>
        </Modal>
      </div>

      <div className="rounded-weldoo-lg border border-weldoo-border-light bg-white p-6 shadow-weldoo-md">
        <h2 className="text-lg font-semibold">States</h2>
        <div className="mt-5 grid gap-5">
          <FormError>
            This is how form-level validation errors are displayed.
          </FormError>
          <LoadingState label="Loading profiles" />
          <EmptyState
            action={<Button variant="secondary">Create first job</Button>}
            description="Once companies start publishing opportunities, they will appear here."
            title="No jobs yet"
          />
        </div>
      </div>
    </div>
  );
}
