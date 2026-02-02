import AppLayout from "@/_features/common/components/AppLayout";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
