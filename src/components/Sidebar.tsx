"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Shield, Settings, Users, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("Officer");
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Check localStorage for isAdmin flag first
      const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
      setIsAdminUser(storedIsAdmin);

      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setUserName(data.name || "");
        setUserEmail(data.email || "");
        setUserRole((data.role || "Officer").trim());
      } catch (err) {
        console.error("Profile load error:", err);
      }
    }

    loadProfile();
  }, []);

  const isAdmin =
    isAdminUser || userRole === "Admin" || pathname.startsWith("/admin/");
  const isMasterActive =
    pathname === "/admin/department" || pathname === "/division";
  const isLeaveActive =
    pathname.startsWith("/dashboard/leave") ||
    pathname === "/admin/leave-type" ||
    pathname === "/admin/leave-balances" ||
    pathname === "/admin/commissioner-assignments" ||
    pathname === "/admin/individual-leave-balance" ||
    pathname === "/admin/my-leave";

  const canHandleLeaveApprovals =
    isAdmin ||
    [
      "DivisionHead",
      "DepartmentHead",
      "Commissioner",
      "Chairperson",
      "SecretaryService",
    ].includes(userRole);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const navButtonClass = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-md transition ${
      isActive ? "bg-black text-white" : "text-black hover:bg-gray-100"
    }`;

  const navSubButtonClass = (isActive: boolean) =>
    `w-full text-left px-4 py-2 rounded-md transition ${
      isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 flex flex-col text-sm">
      <div className="p-6 flex justify-center border-b border-gray-200">
        <Image
          src="/civicleave-logo.svg"
          alt="CivicLeave"
          width={196}
          height={56}
          className="h-12 w-auto"
          priority
        />
      </div>

      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold">
            {userName
              ? userName.charAt(0).toUpperCase()
              : userEmail.charAt(0)?.toUpperCase()}
          </div>
          <p className="text-black truncate">{userEmail}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-3">
        {isAdmin ? (
          <>
            <button
              onClick={() => router.push("/admin/department")}
              className={navButtonClass(isMasterActive)}
            >
              <Shield size={18} />
              Master
            </button>

            <div className="ml-8 mt-1 space-y-1">
              <button
                onClick={() => router.push("/admin/department")}
                className={navSubButtonClass(pathname === "/admin/department")}
              >
                Department
              </button>
              <button
                onClick={() => router.push("/division")}
                className={navSubButtonClass(pathname === "/division")}
              >
                Division
              </button>
            </div>

            <button
              onClick={() => router.push("/dashboard/leave")}
              className={navButtonClass(isLeaveActive)}
            >
              <Shield size={18} />
              Leave
            </button>

            <div className="ml-8 mt-1 space-y-1">
              {canHandleLeaveApprovals && (
                <button
                  onClick={() => router.push("/dashboard/leave/approvals")}
                  className={navSubButtonClass(
                    pathname.startsWith("/dashboard/leave/approvals"),
                  )}
                >
                  Leave Approvals
                </button>
              )}

              <button
                onClick={() => router.push("/admin/leave-type")}
                className={navSubButtonClass(pathname === "/admin/leave-type")}
              >
                Leave Type
              </button>
              <button
                onClick={() => router.push("/admin/leave-balances")}
                className={navSubButtonClass(
                  pathname === "/admin/leave-balances",
                )}
              >
                Leave Balance
              </button>
              <button
                onClick={() => router.push("/admin/commissioner-assignments")}
                className={navSubButtonClass(
                  pathname === "/admin/commissioner-assignments",
                )}
              >
                Commissioner Mapping
              </button>
            </div>

            <button
              onClick={() => router.push("/admin/pending-users")}
              className={navButtonClass(pathname === "/admin/pending-users")}
            >
              <Shield size={18} />
              Pending Approvals
            </button>

            <button
              onClick={() => router.push("/admin/all-users")}
              className={navButtonClass(pathname === "/admin/all-users")}
            >
              <Users size={18} />
              All Users
            </button>

            <button
              onClick={() => router.push("/settings")}
              className={navButtonClass(pathname === "/settings")}
            >
              <Settings size={18} />
              Settings
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/dashboard/leave")}
              className={navButtonClass(isLeaveActive)}
            >
              <Shield size={18} />
              Leave
            </button>

            <div className="ml-8 mt-1 space-y-1">
              <button
                onClick={() => router.push("/dashboard/leave")}
                className={navSubButtonClass(
                  pathname.startsWith("/dashboard/leave") &&
                    !pathname.startsWith("/dashboard/leave/approvals"),
                )}
              >
                Apply Leave
              </button>

              {canHandleLeaveApprovals && (
                <button
                  onClick={() => router.push("/dashboard/leave/approvals")}
                  className={navSubButtonClass(
                    pathname.startsWith("/dashboard/leave/approvals"),
                  )}
                >
                  Leave Approvals
                </button>
              )}
            </div>

            <button
              onClick={() => router.push("/settings")}
              className={navButtonClass(pathname === "/settings")}
            >
              <Settings size={18} />
              Settings
            </button>
          </>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-black hover:bg-gray-100"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ANTI-CORRUPTION COMMISSION
      </div>
    </aside>
  );
}
