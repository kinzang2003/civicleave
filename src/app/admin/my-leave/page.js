"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function MyLeavePage() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    async function loadMyBalance() {
      if (typeof window === "undefined") return;

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?._id) return;

      const res = await fetch(`/api/leave-balances?userId=${user._id}`);
      const data = await res.json();

      setLeaves(Array.isArray(data?.leaves) ? data.leaves : []);
    }

    loadMyBalance();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 ml-64 bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_45%,#ecfdf5_100%)] min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-slate-900">
          My Leave Balance
        </h1>

        <div className="grid md:grid-cols-3 gap-4">
          {leaves.length > 0 ? (
            leaves.map((leave) => (
              <div
                key={leave.leaveTypeId}
                className="bg-white/95 shadow rounded-xl p-5 border border-blue-100 border-l-4 border-l-blue-500"
              >
                <h3 className="text-sm text-slate-500">
                  {leave.leaveTypeName}
                </h3>
                <p className="text-2xl font-bold text-blue-700 mt-2">
                  {leave.balance}
                </p>
                <p className="text-xs text-slate-500">
                  Allocated: {leave.allocated} | Used: {leave.used}
                </p>
              </div>
            ))
          ) : (
            <div className="bg-white p-5 rounded shadow">
              No leave balance found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}