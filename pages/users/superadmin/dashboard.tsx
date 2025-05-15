// pages/admin-dashboard.tsx
import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { AiOutlineShoppingCart, AiOutlineHome, AiOutlineMenu } from "react-icons/ai";
import { MdOutlineReport,MdStorefront, MdKeyboardArrowDown } from "react-icons/md";
import { FaWallet, FaPills } from "react-icons/fa";
import Head from "next/head";

// Import your page components (these are the different sections of the admin dashboard)
import Overview from "../../components/Overview/OverviewPanel";
import Drugs from "../../components/DrugStore";
import ExpensesPanel from "../../components/Expenses/ExpPanel";
import Reports from "../../components/Reports/RepPanel";
import Staff from "../../components/Staff/StaffPanel";
import Stores from "../../components/Stores/StoreLayout";
import Sales from "../../components/Sales/SalesPanel";
import { Store } from "lucide-react";

const AdminDashboard = () => {
  // Use NextAuth's useSession hook to get session data and authentication status.
  const { data: session, status } = useSession();
  // Use Next.js's useRouter hook for programmatic navigation (e.g., redirecting to login).
  const router = useRouter();
  // State to manage the currently active page/section in the dashboard.
  const [activePage, setActivePage] = useState("overview"); // Default to overview
  // State to control the visibility of the mobile sidebar.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State to control the visibility of the user dropdown menu in the header.
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Ref to the sidebar element for handling clicks outside to close it.
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  // State to store the store name from the user's session.
  const [storeName, setStoreName] = useState<string>("");

  // useEffect hook to handle authentication status changes.
  useEffect(() => {
    // If the user is unauthenticated, redirect them to the login page.
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]); // Run this effect when status or router changes.

  // useEffect hook to set the store name from the session when it's available.
  useEffect(() => {
    console.log("Session:", session); // Log the session for debugging purposes.
    // If the session exists and has a user property, set the store name.
    if (session?.user) {
      setStoreName(session.user.storeName);
    }
  }, [session]); // Run this effect when the session changes.

  // Function to handle user logout using NextAuth's signOut function.
  const handleLogout = () => {
    signOut();
  };

  // Function to toggle the sidebar's open/closed state.
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  // Function to toggle the user dropdown menu's open/closed state.
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Function to close the user dropdown menu when the user clicks outside of it.
  const handleBlur = (event: React.FocusEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDropdownOpen(false);
    }
  };

  // useEffect hook to handle clicks outside the sidebar to close it (for mobile view).
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the sidebar ref exists and the click is outside the sidebar, close it.
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    // Add or remove the click event listener based on the sidebar's open state.
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    // Cleanup function to remove the event listener when the component unmounts or sidebar state changes.
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]); // Run this effect when isSidebarOpen changes.

  // Function to render the active page component based on the activePage state.
  const renderActivePage = () => {
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


  return (
    <>
      <Head>
        <title>THE JAPAMA PHARMACY - Super Admin Panel</title>
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
            <img src="/img/icon.jpg" alt="Logo" className="h-15 w-auto" />
            <nav>
              <ul className="space-y-2">
                <li onClick={() => setActivePage("overview")}>
                  <a
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      activePage === "overview" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <AiOutlineHome />
                    <span>Overview</span>
                  </a>
                </li>

                <li onClick={() => setActivePage("DrugStore")}>
                  <a
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      activePage === "DrugStore" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <FaPills />
                    <span>Drug Store</span>
                  </a>
                </li>

                <li onClick={() => setActivePage("sales")}>
                  <a
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      activePage === "sales" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <AiOutlineShoppingCart />
                    <span>Sales</span>
                  </a>
                </li>

                <li onClick={() => setActivePage("staff")}>
                  <a
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      activePage === "staff" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <AiOutlineShoppingCart />
                    <span>Staff</span>
                  </a>
                </li>

                <li onClick={() => setActivePage("reports")}>
                  <a
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      activePage === "reports" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <MdOutlineReport />
                    <span>Reports</span>
                  </a>
                </li>

                
                <li onClick={() => setActivePage("Stores")}>
                  <a
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      activePage === "Stores" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <MdStorefront />
                    <span> Stores </span>
                  </a>
                </li>

                <li onClick={() => setActivePage("expenses")}>
                  <a
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      activePage === "expenses" ? "bg-indigo-500 text-white" : "text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <FaWallet />
                    <span>Expenses</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-6 ml-0 md:ml-64 h-screen">
          {/* Header Section */}
          <header className="flex justify-between items-center mb-4">
            <button
              title="Open User Menu"
              className="md:hidden p-2 text-gray-500 hover:bg-gray-200 rounded-lg"
              onClick={toggleSidebar}
            >
              <AiOutlineMenu size={24} />
            </button>
            <h1 className="text-4xl md:text-3xl font-bold text-blue-600">
              Welcome to {storeName} SUPER ADMIN Panel
            </h1>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500">🔔</button>
              <div className="relative" onBlur={handleBlur}>
                <div className="flex items-center space-x-10 cursor-pointer" onClick={toggleDropdown}>
                  <img src="/img/j.webp" alt="User Profile" className="w-12 h-8 rounded-full" />
                  <button title="Open User Menu" className="focus:outline-none">
                    <MdKeyboardArrowDown size={20} />
                  </button>
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                    <ul>
                      <li>
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                          Your Profile
                        </a>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </header>
          {renderActivePage()}
          
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;