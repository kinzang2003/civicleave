"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Shield,
  Settings,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

function normalizeRole(rawRole?: string): string {
  const normalized = (rawRole || "Officer")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  const roleMap: Record<string, string> = {
    officer: "Officer",
    divisionhead: "DivisionHead",
    departmenthead: "DepartmentHead",
    commissioner: "Commissioner",
    chairperson: "Chairperson",
    secretaryservice: "SecretaryService",
    admin: "Admin",
  };

  return roleMap[normalized] || "Officer";
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("Officer");
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [openSection, setOpenSection] = useState<"master" | "leave" | null>(
    null,
  );

  const getEmailFromToken = (token: string): string => {
    try {
      const [, payload] = token.split(".");
      if (!payload) return "";
      const decoded = JSON.parse(atob(payload));
      return typeof decoded?.email === "string" ? decoded.email : "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;

      const tokenEmail = getEmailFromToken(token);
      if (tokenEmail) {
        setUserEmail(tokenEmail);
      }

      // Check localStorage for isAdmin flag first
      const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
      setIsAdminUser(storedIsAdmin);

      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        if (!data || typeof data !== "object") return;

        const profile = data as {
          name?: string;
          email?: string;
          role?: string;
        };

        const resolvedName = (profile.name || "").trim();
        setUserName(resolvedName);
        setUserEmail(profile.email || tokenEmail || "");
        setUserRole(normalizeRole(profile.role));
      } catch (err) {
        console.error("Profile load error:", err);
      }
    }

    loadProfile();
  }, [pathname]);

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

  const displayedOpenSection =
    openSection ||
    (isMasterActive
      ? "master"
      : isLeaveActive || (!isAdmin && canHandleLeaveApprovals)
        ? "leave"
        : null);

  const toggleSection = (section: "master" | "leave") => {
    setOpenSection(displayedOpenSection === section ? null : section);
  };

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
        <p className="text-xs text-gray-500 truncate">{userName || "User"}</p>
        <p className="text-sm text-black truncate">
          {userEmail || "No email available"}
        </p>
      </div>

      <nav className="flex-1 px-4 py-3 space-y-2 overflow-y-auto min-h-0">
        {isAdmin ? (
          <>
            <button
              onClick={() => toggleSection("master")}
              className={navButtonClass(isMasterActive)}
            >
              <Shield size={18} />
              <span className="flex-1 text-left">Master</span>
              {displayedOpenSection === "master" ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {displayedOpenSection === "master" && (
              <div className="ml-8 mt-1 space-y-1">
                <button
                  onClick={() => router.push("/admin/department")}
                  className={navSubButtonClass(
                    pathname === "/admin/department",
                  )}
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
            )}

            <button
              onClick={() => toggleSection("leave")}
              className={navButtonClass(isLeaveActive)}
            >
              <Shield size={18} />
              <span className="flex-1 text-left">Leave</span>
              {displayedOpenSection === "leave" ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {displayedOpenSection === "leave" && (
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
                  className={navSubButtonClass(
                    pathname === "/admin/leave-type",
                  )}
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
            )}

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
              onClick={() => toggleSection("leave")}
              className={navButtonClass(isLeaveActive)}
            >
              <Shield size={18} />
              <span className="flex-1 text-left">Leave</span>
              {displayedOpenSection === "leave" ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {displayedOpenSection === "leave" && (
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
            )}

            <button
              onClick={() => router.push("/settings")}
              className={navButtonClass(pathname === "/settings")}
            >
              <Settings size={18} />
              Settings
            </button>
          </>
        )}
      </nav>

      <div className="px-4 pb-3 pt-2 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-black hover:bg-gray-100"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ANTI-CORRUPTION COMMISSION
      </div>
    </aside>
  );
}
