import React, { useState, useEffect } from "react";
import { Menu, Bell, LogOut, Settings, User, Wrench } from "lucide-react";
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import NavigationMenu from "../Navigation/NavigationMenu";

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* =========================
     Prevent background scroll on mobile
  ========================= */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileOpen]);

  const getRoleDisplay = (role) => {
    const roles = {
      facility_manager: "Facility Manager",
      technician: "Maintenance Technician",
      vendor: "Vendor",
      staff: "Staff Member",
      finance: "Finance Officer",
      admin: "Administrator",
    };
    return roles[role] || role;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= HEADER ================= */}
      <header
        className="
          sticky top-0 z-50 h-16
          flex items-center justify-between
          px-6
          bg-white/95 backdrop-blur
          border-b border-slate-200
        "
      >
        {/* Left: Mobile menu + Brand */}
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-slate-100 transition"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-[#1e3a8a] flex items-center justify-center text-white font-semibold overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 9, ease: 'linear', repeat: Infinity }}
                  style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transformOrigin: 'center' }}
                >
                  <Wrench size={20} color="#fff" />
                </motion.div>
              </div>

              <div>
                <div className="text-sm font-semibold text-[#1e3a8a]">FacilityPro</div>
                <div className="text-xs text-slate-500">Asset & Maintenance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-slate-100 transition"
            aria-label="Notifications"
            title="Notifications"
          >
            <Badge
              className="
                absolute -top-1 -right-1
                h-5 min-w-[1.25rem]
                px-1
                rounded-full
                text-[11px]
                bg-[#1e3a8a] text-white
              "
              aria-label="4 unread notifications"
            >
              4
            </Badge>
            <Bell className="h-5 w-5" />
          </Button>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-border" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-slate-100 transition"
              >
                <Avatar className="h-8 w-8 border border-border bg-blue-50">
                  <AvatarImage
                    src={user?.avatar}
                    alt={user?.name || "User avatar"}
                  />
                  <AvatarFallback className="bg-[#e6eefc] text-[#1e3a8a] font-semibold text-xs">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-slate-900">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {getRoleDisplay(user?.role)}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={12}
              className="w-56 rounded-lg border border-slate-200 shadow-lg"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-200 bg-blue-50">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || getRoleDisplay(user?.role)}
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer gap-2"
              >
                <User className="h-4 w-4 text-slate-500" />
                My Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate("/settings")}
                className="cursor-pointer gap-2"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={async () => await logout?.()}
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed left-0 top-0 z-40
          h-screen w-72
          pt-16
          bg-white border-r border-slate-200 shadow-sm
          overflow-y-auto
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <NavigationMenu onCloseMobile={() => setMobileOpen(false)} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= MAIN ================= */}
      <main className="p-4 md:p-6 md:ml-72">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
