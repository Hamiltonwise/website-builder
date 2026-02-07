"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, Settings, Menu, X, LayoutTemplate, FileText, LogOut, User, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthSync } from "@/contexts/AuthSyncContext";

const navItems = [
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/logs", label: "Logs", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuthSync();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="py-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/projects" className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src="/logo.png"
                    alt="Alloro Logo"
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                </motion.div>
                <span className="font-bold text-xl text-gray-900">
                  <span className="text-brand-500">Alloro</span> Websites
                  Manager
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - moved to right */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      isActive
                        ? "bg-brand-50 text-brand-600 border border-brand-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* User Menu */}
              <div className="relative ml-2" ref={userMenuRef}>
                <motion.button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium transition-all hover:border-brand-300 hover:shadow-md"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-brand-50 text-brand-500">
                    <User className="h-4 w-4" />
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                    >
                      <button
                        type="button"
                        onClick={handleLogoutClick}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-100"
        >
          <div className="px-4 pt-2 pb-4 space-y-1 max-w-7xl mx-auto">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {/* Mobile Logout */}
            <button
              onClick={() => {
                setIsOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <motion.div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-red-50"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                >
                  <LogOut className="h-7 w-7 text-red-500" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Log Out?
                </h3>
                <p className="text-sm text-gray-500">
                  You&apos;ll need to sign in again to access the dashboard.
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={logout}
                  className="flex-1 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-500/90 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
