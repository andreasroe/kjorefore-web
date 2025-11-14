'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CloudRain, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SideMenu } from '@/components/ui/side-menu';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { href: '/', label: 'Hjem' },
    { href: '/om', label: 'Om Kjørefore' },
    { href: '/terms', label: 'Vilkår' },
  ];

  return (
    <>
      <header className="bg-white border-b shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <CloudRain className="w-6 h-6" />
              Kjørefore
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">
              Værvarsel langs hele kjøreruten
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Åpne meny"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <nav className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-primary" />
            Meny
          </h2>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg py-3 px-4 rounded-lg hover:bg-accent transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SideMenu>
    </>
  );
}
