'use client'; // Ensures the component is rendered only on the client side

import { useEffect, useState } from 'react';
import Typography from "@components/Typography";
import Card from "@components/Card";
import { TProject } from "@app/dashboard/project/project";
import Loading from '@components/Loading';

// Data fetching functions
async function fetchProjects(tag: string): Promise<TProject[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  const res = await fetch(`${baseUrl}/api/project?tag=${tag}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${tag} project data`);
  }

  return res.json();
}

const Projects = () => {
  const [personalProjectsData, setPersonalProjectsData] = useState<TProject[]>([]);
  const [professionalProjectsData, setProfessionalProjectsData] = useState<TProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data on client side
    const fetchData = async () => {
      try {
        const [personalData, professionalData] = await Promise.all([
          fetchProjects('personal'),
          fetchProjects('professional')
        ]);
        setPersonalProjectsData(personalData);
        setProfessionalProjectsData(professionalData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading></Loading>
  if (error) return <Typography>{error}</Typography>;

  return (
    <main className="container">
      <div className="flex flex-col gap-2 my-12">
        <Typography size="h3/semi-bold" className="!text-3xl sm:text-4xl">
          Projects
        </Typography>
        <Typography size="body2/normal" variant="secondary">
          Projects I’ve worked on
        </Typography>
      </div>
      <span className="w-full block border border-primary-300 absolute right-0"></span>

      <div className="flex flex-col gap-2 my-4 mt-20">
        <Typography size="h5/semi-bold" variant="secondary">
          Professional
        </Typography>

        <div className="flex flex-col gap-8 mb-4 ">
          {professionalProjectsData.length ? (
            professionalProjectsData
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .map((data) => (
                <Card
                  key={data._id}
                  title={data.title}
                  description={data.description}
                  actionLink={data.demoLink}
                  actionText="Visit Site"
                  secondaryActionLink={data.githubLink}
                  secondaryActiontext="Github"
                  projectLogoSrc={data.logo}
                  projectScreenshotSrc={data.thumbnail}
                  techUsed={data.techUsed}
                  variant="projectCard"
                />
              ))
          ) : (
            <Typography>No Data found</Typography>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 my-8">
        <Typography size="h5/semi-bold" variant="secondary">
          Personal
        </Typography>
        <div className="flex flex-col gap-8 mb-4 ">
          {personalProjectsData.length ? (
            personalProjectsData
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .map((data) => (
                <Card
                  key={data._id}
                  title={data.title}
                  description={data.description}
                  actionLink={data.demoLink}
                  actionText="Visit Site"
                  secondaryActionLink={data.githubLink}
                  secondaryActiontext="Github"
                  projectLogoSrc={data.logo}
                  projectScreenshotSrc={data.thumbnail}
                  techUsed={data.techUsed}
                  variant="projectCard"
                />
              ))
          ) : (
            <Typography>No Data found</Typography>
          )}
        </div>
      </div>
    </main>
  );
};

export default Projects;
