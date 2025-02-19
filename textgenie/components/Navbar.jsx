'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react'; // Icons for hamburger and close

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Hamburger Menu (Mobile Only) */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg md:hidden"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-40`}
      >
        <div className="p-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              width={70}
              height={70}
              alt="logo"
              className="w-12 h-12 md:w-16 md:h-16"
            />
            <span className="text-white text-lg font-bold ml-2">TextGenie</span>
          </Link>

          {/* Links */}
          <div className="mt-8 flex flex-col gap-2">
            <Link
              href="/about"
              className="text-white hover:bg-gray-700 p-2 rounded"
            >
              About
            </Link>
            <Link
              href="/services"
              className="text-white hover:bg-gray-700 p-2 rounded"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="text-white hover:bg-gray-700 p-2 rounded"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Navbar;