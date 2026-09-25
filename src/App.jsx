import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import IndiaListings from "./pages/IndiaListings";
import Listings from "./pages/Listings";
import Property from "./pages/Property";
import Agents from "./pages/Agents";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MediaSection from "./pages/MediaSection";
import Login from "./pages/Admin/Login";
import RequireAuth from "./components/RequireAuth";
import Commercial from "./pages/Commercial";
import BlogIndex from "./pages/Blogs/BlogIndex";
import BlogPost from "./pages/Blogs/BlogPost";
import Career from "./pages/Career";
import Gallery from "./pages/Gallery";

import Admin from "./pages/Admin/Admin";
import AdminPropertyListings from "./pages/Admin/AdminPropertyListings";
import AdminAllProperties from "./pages/Admin/AdminAllProperties";
import AdminInquiries from "./pages/Admin/AdminInquiries";
import FloatingActionDesk from "./components/FloatingActionDesk";

import NewLaunchPage from "./pages/NewLaunchPage";

// Specialized Role Dashboards
import BuyerDashboard from "./pages/Dashboards/BuyerDashboard";
import DealerDashboard from "./pages/Dashboards/DealerDashboard";
import CheckerDashboard from "./pages/Dashboards/CheckerDashboard";
import FinanceDashboard from "./pages/Dashboards/FinanceDashboard";

// Role Switcher Bar
import RolePersonaBar from "./components/RolePersonaBar";
import { appStore } from "./lib/appStore";

function DynamicDashboardRedirect() {
  const role = appStore.getState().currentUserRole || "super_admin";
  if (role === "buyer") return <Navigate to="/dashboard/buyer" replace />;
  if (role === "dealer") return <Navigate to="/dashboard/dealer" replace />;
  if (role === "checker") return <Navigate to="/dashboard/checker" replace />;
  if (role === "finance") return <Navigate to="/dashboard/finance" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/property/:id" element={<Property />} />
        <Route path="/projects/:slug" element={<Property />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/media" element={<MediaSection />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/commercial" element={<Commercial />} />
        <Route path="/career" element={<Career />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/sell-or-rent-out-property" element={<Listings />} />
        <Route path="/india" element={<IndiaListings />} />
        <Route path="/new-launch" element={<NewLaunchPage />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        {/* RBAC Role Dashboards */}
        <Route path="/dashboard" element={<DynamicDashboardRedirect />} />
        <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
        <Route path="/dashboard/dealer" element={<DealerDashboard />} />
        <Route path="/dashboard/checker" element={<CheckerDashboard />} />
        <Route path="/dashboard/finance" element={<FinanceDashboard />} />
        <Route path="/financial-dashboard" element={<FinanceDashboard />} />
        <Route path="/financials" element={<FinanceDashboard />} />
        <Route path="/dashboard/super-admin" element={<Admin />} />

        {/* Super Admin & System Owner (Sudhir) */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/properties" element={<AdminPropertyListings />} />
        <Route path="/admin/all-properties" element={<AdminAllProperties />} />
        <Route path="/admin/inquiries" element={<AdminInquiries />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Interactive Floating Tools (Right-Side Unified Dock) */}
      <FloatingActionDesk />

      {/* Specialized Portal Access & Dashboards */}
    </BrowserRouter>
  );
}
