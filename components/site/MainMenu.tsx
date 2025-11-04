'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { NavItem } from '@/lib/navigation';

export default function MainMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <nav className="relative" aria-label="Main">
      {/* Desktop */}
      <ul className="hidden items-center gap-6 lg:flex">
        {items.map((item) => (
          <li key={item.id} className="relative group">
            <Link
              href={item.href}
              className={`text-sm transition-colors ${
                isActive(item.href) ? 'font-semibold text-black' : 'text-neutral-600 hover:text-black'
              }`}
            >
              {item.label}
            </Link>

            {/* Dropdown de 1-2 niveles */}
            {item.children?.length ? (
              <div className="invisible absolute left-0 top-full z-50 mt-2 min-w-56 rounded-2xl border bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                <ul className="flex flex-col">
                  {item.children.map((child) => (
                    <li key={child.id} className="relative">
                      <Link
                        href={child.href}
                        className="block rounded-md px-3 py-2 text-sm hover:bg-neutral-50"
                      >
                        {child.label}
                      </Link>

                      {/* Nietos */}
                      {child.children?.length ? (
                        <div className="absolute left-full top-0 ml-2 hidden min-w-56 rounded-2xl border bg-white p-2 shadow-lg group-hover:block">
                          <ul className="flex flex-col">
                            {child.children.map((g) => (
                              <li key={g.id}>
                                <Link
                                  href={g.href}
                                  className="block rounded-md px-3 py-2 text-sm hover:bg-neutral-50"
                                >
                                  {g.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Mobile toggle */}
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm lg:hidden"
      >
        {open ? 'Close' : 'Menu'}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute left-0 top-[110%] z-50 w-[92vw] max-w-sm rounded-2xl border bg-white p-4 shadow-lg lg:hidden">
          <MobileList items={items} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </nav>
  );
}

function MobileList({ items, onNavigate }: { items: NavItem[]; onNavigate: () => void }) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  return (
    <ul className="flex flex-col gap-1">
      {items.map((it) => {
        const hasChildren = !!it.children?.length;
        const isOpen = !!openIds[it.id];

        return (
          <li key={it.id}>
            <div className="flex items-center justify-between">
              <Link
                href={it.href}
                className="block flex-1 rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                onClick={onNavigate}
              >
                {it.label}
              </Link>

              {hasChildren && (
                <button
                  type="button"
                  aria-label="Toggle submenu"
                  className="ml-2 rounded-md border px-2 py-1 text-xs"
                  onClick={() => setOpenIds((m) => ({ ...m, [it.id]: !isOpen }))}
                >
                  {isOpen ? '−' : '+'}
                </button>
              )}
            </div>

            {hasChildren && isOpen && (
              <ul className="ml-3 mt-1 flex flex-col rounded-lg border-l pl-3">
                {it.children!.map((ch) => (
                  <li key={ch.id}>
                    <Link
                      href={ch.href}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                      onClick={onNavigate}
                    >
                      {ch.label}
                    </Link>
                    {ch.children?.length ? (
                      <ul className="ml-3 mt-1 flex flex-col border-l pl-3">
                        {ch.children.map((g) => (
                          <li key={g.id}>
                            <Link
                              href={g.href}
                              className="block rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                              onClick={onNavigate}
                            >
                              {g.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
