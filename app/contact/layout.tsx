import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Gaurav - Full Stack Developer",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
