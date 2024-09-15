"use client";
import { useRouter } from "next/navigation";

import { ChangeEvent, useRef, useState } from "react";
import AddEditForm from "@components/AddEditForm";
import Typography from "@components/Typography";
import { TProject } from "@app/dashboard/project/project";

const AddProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [statusMessage, setStatusMessage] = useState<{
    variant: "error" | "success";
    message: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAdd = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      if (formRef.current) {
        const formData = new FormData(formRef.current);

        const res = await fetch('/api/project', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to add project");
        }

        const addedProject: TProject = await res.json();

        setStatusMessage({
          variant: "success",
          message: `Project "${addedProject.title}" added successfully`,
        });

        formRef.current.reset();
        router.push('/dashboard/project')
      }
    } catch (error) {
      console.error(error);
      setStatusMessage({
        variant: "error",
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <Typography size="h5/semi-bold" className="capitalize text-center">
        Add New Project
      </Typography>
      <div className="flex justify-center">
        <AddEditForm
          isLoading={isLoading}
          actionText="Add Project"
          statusMessage={statusMessage}
          handleSubmit={handleAdd}
          formRef={formRef}
          variant="project"
        />
      </div>
    </main>
  );
};

export default AddProject;