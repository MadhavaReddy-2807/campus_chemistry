import { connection } from "next/server";
import HomePage from "@/app/page";

export const instant = false;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await connection();
  return <HomePage searchParams={searchParams} />;
}
