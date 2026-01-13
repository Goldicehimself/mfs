import React, { useState, useEffect } from "react";
import { Menu, Bell, LogOut, Settings, User } from "lucide-react";
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

  // ✅ Prevent background scroll on mobile
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
    <div className="min-h-screen bg-background text-foreground">

      {/* HEADER */}
      <header className="mp-header sticky top-0 z-50 flex h-16 items-center justify-between px-6">
        {/* Left Section: Menu + Logo */}
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mp-header-action"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="brand-accent text-base">SMMP</span>
              <div className="h-4 w-px bg-gray-200"></div>
              <span className="text-sm font-medium text-gray-700">FacilityPro</span>
            </div>
          </div>
        </div>

        {/* Right Section: Notifications + User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative mp-header-action"
            title="Notifications"
          >
            <span className="mp-notification-badge">4</span>
            <Bell className="h-5 w-5" />
          </Button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2.5 px-2 mp-header-action"
              >
                <Avatar className="h-8 w-8 border border-gray-200 bg-blue-50">
                  <AvatarImage
                    src={user?.avatar}
                    alt={user?.name || "User avatar"}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-xs">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden sm:flex flex-col items-start">
                  <p className="text-sm font-semibold text-gray-900 leading-none">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {getRoleDisplay?.(user?.role) || user?.role}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={12}
              className="w-56 rounded-lg border border-gray-200 shadow-lg"
            >
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200 bg-blue-50">
                    <AvatarImage
                      src={user?.avatar}
                      alt={user?.name || "User avatar"}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || getRoleDisplay?.(user?.role)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <DropdownMenuItem 
                onClick={() => navigate("/profile")}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <User className="h-4 w-4 text-gray-400" />
                <span>My Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => navigate("/settings")}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuItem
                onClick={async () => await logout?.()}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`mp-sidebar fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72
        overflow-y-auto overscroll-contain touch-pan-y
        transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <NavigationMenu onCloseMobile={() => setMobileOpen(false)} />
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="p-4 md:p-6 md:ml-72">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
