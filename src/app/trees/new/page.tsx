"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TreeRegistrationWizard } from "@/components/trees/wizard/TreeRegistrationWizard";

export default function NewTreePage() {
  return (
    <AppLayout>
      <div className="py-2 animate-in fade-in duration-200">
        <TreeRegistrationWizard />
      </div>
    </AppLayout>
  );
}
