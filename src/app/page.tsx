import { HomeLauncher } from "@/components/home/HomeLauncher";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? decodeURIComponent(params.error) : undefined;

  return <HomeLauncher errorMessage={errorMessage} />;
}
