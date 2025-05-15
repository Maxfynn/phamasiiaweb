"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Unauthorized = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <h2 className="font-bold text-xl">Unauthorized Access</h2>
        <p>You don't have permission to view this page.</p>
      </div>
      <p>Redirecting to home page...</p>
    </div>
  );
};

export default Unauthorized;