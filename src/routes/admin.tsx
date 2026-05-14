import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { store } from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const u = store.getUser();
    if (!u || u.role !== "admin") {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — Turfly" }] }),
});
