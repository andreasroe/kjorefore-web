'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CloudRain, Menu, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SideMenu } from '@/components/ui/side-menu';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const menuItems = [
    { href: '/', label: 'Hjem' },
    { href: '/om', label: 'Om Kjørefore' },
    { href: '/terms', label: 'Vilkår' },
  ];

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut({ callbackUrl: '/' });
  };

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
            <p className="text-sm text-muted-foreground hidden sm:block text-left">
              Værvarsel for din kjøretur
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

          {session?.user && (
            <div className="mb-6 p-4 bg-accent rounded-lg flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{session.user.name || session.user.email}</p>
                {session.user.name && (
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                )}
              </div>
            </div>
          )}

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

          <div className="mt-6 pt-6 border-t">
            {session ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-start text-lg py-6"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logg ut
              </Button>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="default" className="w-full justify-start text-lg py-6">
                  <LogIn className="w-5 h-5 mr-3" />
                  Logg inn
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </SideMenu>
    </>
  );
}
