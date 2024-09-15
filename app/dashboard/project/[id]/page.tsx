"use client";
import AddEditForm from "@components/AddEditForm";
import Typography from "@components/Typography";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { TProject } from "../project"
import { useRouter } from "next/navigation";

const EditProduct = ({ params }: { params: { id: string } }) => {
  const [projectData, setProjectData] = useState<TProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  const [statusMessage, setStatusMessage] = useState<{
    variant: "error" | "success";
    message: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const getProject = async () => {
      try {
        const res = await fetch(`/api/project/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await res.json();
        setProjectData(data);
      } catch (error) {
        console.log(error);
        setStatusMessage({ variant: "error", message: "Failed to fetch project" });
      }
    };
    getProject();
  }, [params.id]);

  const handleUpdate = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      if (formRef.current) {
        const formData = new FormData(formRef.current);

        // Make sure to include the project ID if needed for server-side validation
        formData.append('id', params.id);

        const res = await fetch(`/api/project/${params.id}`, {
          method: "PUT",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Failed to update project`);
        }

        setStatusMessage({
          variant: "success",
          message: "Project data updated successfully",
        });
        router.push('/dashboard/project')
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        setStatusMessage({ variant: "error", message: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container ">
      <Typography size="h5/semi-bold" className="capitalize text-center">
        Edit Project
      </Typography>
      <div className="flex justify-center ">
        <AddEditForm
          actionText="Update Project"
          isLoading={isLoading}
          statusMessage={statusMessage}
          handleSubmit={handleUpdate}
          formData={projectData}
          formRef={formRef}
          variant="project"
        />
      </div>
    </main>
  );
};

export default EditProduct;
