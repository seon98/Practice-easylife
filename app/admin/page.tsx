import AdminDashboard from "@/components/admin/AdminDashboard";
import { getServices } from "@/lib/api/services";

export default async function AdminPage() {
  return <main className="mx-auto min-h-screen max-w-7xl px-6 py-12"><h1 className="mb-8 text-3xl font-bold">서비스 관리</h1><AdminDashboard initialServices={await getServices()} /></main>;
}
