import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function AdminHome() {
  redirect(ROUTES.companies);
}
