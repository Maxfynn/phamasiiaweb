"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation"; // Updated import
import { AiOutlineShoppingCart, AiOutlineHome, AiOutlineMenu } from "react-icons/ai";
import { MdOutlineReport, MdStorefront, MdKeyboardArrowDown, MdOutlinePeople } from "react-icons/md";
import { FaWallet, FaPills } from "react-icons/fa";
import Head from "next/head";
import Image from "next/image"; 
import Link from "next/link";

// Import your page components
import Overview from "../../../components/Overview/OverviewPanel";
import Drugs from "../../../components/DrugStore/index";
import ExpensesPanel from "../../../components/Expenses/ExpPanel";
import Reports from "../../../components/Reports/RepPanel";
import Staff from "../../../components/Staff/StaffPanel";
import Stores from "../../../components/Stores/StoreLayout";
import Sales from "../../../components/Sales/SalesPanel";
import Unauthorized from "../../../components/Unauthorized";

type Page =
  | "overview"
  | "DrugStore"
  | "sales"
  | "Stores"
  | "staff"
  | "reports"
  | "expenses";

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activePage, setActivePage] = useState<Page>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [storeName, setStoreName] = useState<string>("JAPAMA PHARMACY");
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  // Check authentication and authorization
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status === "authenticated") {
      // Check if user has admin or superadmin role
      const userRole = session?.user?.role?.toLowerCase();
      if (userRole !== "admin" && userRole !== "superadmin") {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
        setStoreName(session.user.storeName || "JAPAMA PHARMACY");
      }
    }
  }, [status, session, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleBlur = (event: React.FocusEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const renderActivePage = () => {
    if (!isAuthorized) return <Unauthorized />;

    switch (activePage) {
      case "overview":
        return <Overview storeName={storeName} />;
      case "DrugStore":
        return <Drugs />;
      case "sales":
        return <Sales />;
      case "Stores":
        return <Stores />;
      case "staff":
        return <Staff />;
      case "reports":
        return <Reports />;
      case "expenses":
        return <ExpensesPanel />;
      default:
        return <div>Page not found</div>;
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Unauthorized />;
  }

  return (
    <>
      <Head>
        <title>THE JAPAMA PHARMACY - Admin Panel</title>
        <link rel="icon" href="/img/icon.jpg" />
      </Head>

      <div className="flex w-full h-screen">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full shadow-xl w-64 bg-white z-20 transform transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <div className="px-6 py-4">
            <Image 
              src="/img/icon.jpg" 
              alt="Logo" 
              width={150} 
              height={50} 
              className="w-auto h-16"
              priority
            />
            <nav className="mt-4">
              <ul className="space-y-2">
                <li onClick={() => setActivePage("overview")}>
                  <button className={`flex items-center space-x-3 p-2 rounded-lg w-full text-left ${
                    activePage === "overview" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                  }`}>
                    <AiOutlineHome />
                    <span>Overview</span>
                  </button>
                </li>
                <li onClick={() => setActivePage("DrugStore")}>
                  <button className={`flex items-center space-x-3 p-2 rounded-lg w-full text-left ${
                    activePage === "DrugStore" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                  }`}>
                    <FaPills />
                    <span>Drug Store</span>
                  </button>
                </li>
                <li onClick={() => setActivePage("sales")}>
                  <button className={`flex items-center space-x-3 p-2 rounded-lg w-full text-left ${
                    activePage === "sales" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                  }`}>
                    <AiOutlineShoppingCart />
                    <span>Sales</span>
                  </button>
                </li>
                <li onClick={() => setActivePage("staff")}>
  <button className={`flex items-center space-x-3 p-2 rounded-lg w-full text-left ${
    activePage === "staff" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
  }`}>
    <MdOutlinePeople />
    <span>Staff</span>
  </button>
</li>

{session?.user?.role?.toLowerCase() === "superadmin" && (
  <li onClick={() => setActivePage("Stores")}>
    <button className={`flex items-center space-x-3 p-2 rounded-lg w-full text-left ${
      activePage === "Stores" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
    }`}>
      <MdStorefront />
      <span>Stores</span>
    </button>
  </li>
)}

                <li onClick={() => setActivePage("reports")}>
                  <button className={`flex items-center space-x-3 p-2 rounded-lg w-full text-left ${
                    activePage === "reports" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                  }`}>
                    <MdOutlineReport />
                    <span>Reports</span>
                  </button>
                </li>
                <li onClick={() => setActivePage("expenses")}>
                  <button className={`flex items-center space-x-3 p-2 rounded-lg w-full text-left ${
                    activePage === "expenses" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                  }`}>
                    <FaWallet />
                    <span>Expenses</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-6 ml-0 md:ml-64 overflow-y-auto">
          <header className="flex justify-between items-center mb-6">
            <button
              title="Open Menu"
              className="md:hidden p-2 text-gray-500 hover:bg-gray-200 rounded-lg"
              onClick={toggleSidebar}
            >
              <AiOutlineMenu size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
              Welcome to {storeName}
            </h1>
            <div className="relative" onBlur={handleBlur}>
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={toggleDropdown}
              >
                <Image
                  src="/img/j.webp"
                  alt="User"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <MdKeyboardArrowDown size={20} />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                  <ul>
                    <li>
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Your Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </header>
          {renderActivePage()}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;