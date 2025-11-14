'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function SideMenu({ isOpen, onClose, children }: SideMenuProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling on body when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side menu */}
      <div
        className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Close button */}
        <div className="flex justify-end p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Lukk meny"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-73px)]">
          {children}
        </div>
      </div>
    </>
  );
}
