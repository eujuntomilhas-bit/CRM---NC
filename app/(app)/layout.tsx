import Sidebar from "@/components/shared/Sidebar"
import MobileSidebar from "@/components/shared/MobileSidebar"

type Props = {
  children: React.ReactNode
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileSidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
