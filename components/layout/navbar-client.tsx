"use client";

import CartModal from "components/cart/modal";
import { SiteLogo } from "components/site-logo";
import {
  buildCategoryTree,
  type CategoryNode,
  type FlatCategory,
} from "lib/category-tree";
import { FIXED_MENU, MAIN_MENU_SECTIONS } from "lib/constants";
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import MobileMenu from "./navbar/mobile-menu";
import Search, { SearchSkeleton } from "./navbar/search";

function collectionFromPath(path: string): string | null {
  if (!path.includes("collection=")) return null;
  return new URLSearchParams(path.split("?")[1] || "").get("collection");
}

function containsHandle(node: CategoryNode, handle: string): boolean {
  if (node.handle === handle) return true;
  return node.children.some((child) => containsHandle(child, handle));
}

function isNavActive(
  href: string,
  pathname: string,
  searchParams: URLSearchParams,
  sectionRoot?: CategoryNode | null,
): boolean {
  if (href === "/") return pathname === "/";
  const wanted = collectionFromPath(href);
  if (wanted) {
    if (pathname !== "/products") return false;
    const current = searchParams.get("collection");
    if (!current) return false;
    if (current === wanted) return true;
    // Highlight root (e.g. Подаръци) when viewing a subcategory (Тест)
    if (sectionRoot) return containsHandle(sectionRoot, current);
    return false;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const NAV_LINK_CLASS =
  "relative whitespace-nowrap pb-1 text-sm font-medium tracking-[0.02em] transition-colors xl:text-[0.9375rem]";

function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-paper-green transition-all duration-300 ${
        active
          ? "scale-x-100 opacity-100"
          : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60"
      }`}
    />
  );
}

function NavLink({
  href,
  title,
  sectionRoot,
}: {
  href: string;
  title: string;
  sectionRoot?: CategoryNode | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = isNavActive(href, pathname, searchParams, sectionRoot);

  return (
    <Link
      href={href}
      prefetch={true}
      className={`${NAV_LINK_CLASS} ${
        isActive
          ? "text-paper-green"
          : "text-paper-heading/80 hover:text-paper-green"
      }`}
    >
      {title}
      <NavUnderline active={isActive} />
    </Link>
  );
}

function DropdownTreeNode({
  node,
  depth = 0,
  onNavigate,
}: {
  node: CategoryNode;
  depth?: number;
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  const pad = 10 + depth * 12;

  if (!hasChildren) {
    return (
      <Link
        href={`/products?collection=${node.handle}`}
        onClick={onNavigate}
        className="block rounded-xl py-2 pr-3 text-sm text-paper-text transition-colors hover:bg-paper-accent-bg/80 hover:text-paper-green"
        style={{ paddingLeft: `${pad}px` }}
      >
        {node.title}
      </Link>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-0.5 rounded-xl transition-colors hover:bg-paper-accent-bg/80"
        style={{ paddingLeft: `${pad}px` }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-1.5 py-2 pr-1 text-left text-sm text-paper-text hover:text-paper-green"
        >
          <ChevronRightIcon
            className={`h-3.5 w-3.5 shrink-0 text-paper-muted transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
          <span className="truncate font-medium">{node.title}</span>
        </button>
        <Link
          href={`/products?collection=${node.handle}`}
          onClick={onNavigate}
          className="shrink-0 px-2 py-2 text-[11px] text-paper-muted hover:text-paper-green"
          title={`Всички в ${node.title}`}
        >
          всички
        </Link>
      </div>
      {expanded && (
        <div className="ml-3 border-l border-paper-border/80">
          {node.children.map((child) => (
            <DropdownTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryNavItem({
  title,
  href,
  rootHandle,
  categories,
}: {
  title: string;
  href: string;
  rootHandle: string;
  categories: FlatCategory[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tree = buildCategoryTree(categories);
  const root = tree.find((n) => n.handle === rootHandle) ?? null;
  const children = root?.children ?? [];
  const hasTree = children.length > 0;
  const isActive = isNavActive(href, pathname, searchParams, root);

  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  if (!hasTree) {
    return (
      <li className="group">
        <NavLink href={href} title={title} sectionRoot={root} />
      </li>
    );
  }

  return (
    <li
      ref={ref}
      className="group relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-0.5">
        <Link
          href={href}
          prefetch={true}
          className={`${NAV_LINK_CLASS} ${
            isActive || open
              ? "text-paper-green"
              : "text-paper-heading/80 hover:text-paper-green"
          }`}
        >
          {title}
          <NavUnderline active={isActive || open} />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={`${title} — подкатегории`}
          onClick={() => setOpen((v) => !v)}
          className={`pb-1 transition-colors ${
            isActive || open
              ? "text-paper-green"
              : "text-paper-heading/60 hover:text-paper-green"
          }`}
        >
          <ChevronDownIcon
            className={`h-3 w-3 shrink-0 transition-transform duration-300 xl:h-3.5 xl:w-3.5 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="absolute left-1/2 top-full z-50 pt-2.5 -translate-x-1/2">
          <div className="paper-dropdown-panel max-h-[70vh] w-72 overflow-y-auto p-3.5">
            <Link
              href={href}
              onClick={() => setOpen(false)}
              className="mb-2.5 block rounded-xl border border-paper-green/15 bg-paper-accent-bg/80 px-3.5 py-2.5 text-sm font-medium text-paper-heading transition-colors hover:border-paper-green/30 hover:bg-paper-accent-bg hover:text-paper-green"
            >
              Виж всички {title.toLowerCase()}
            </Link>
            <p className="mb-2 px-1.5 font-heading text-[11px] tracking-wider text-paper-muted uppercase">
              Категории
            </p>
            {children.map((child) => (
              <DropdownTreeNode
                key={child.id}
                node={child}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

function SearchToggle() {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [shown, setShown] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShown(true));
      });
      return () => cancelAnimationFrame(id);
    }

    setShown(false);
    const timeout = window.setTimeout(() => setRendered(false), 300);
    return () => window.clearTimeout(timeout);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Затвори търсене" : "Търсене"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-paper-text transition-colors hover:bg-paper-surface-muted hover:text-paper-green"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>

      {rendered && (
        <div className="absolute inset-x-0 top-full z-50 overflow-hidden">
          <div
            className={`border-b border-paper-border-strong bg-paper-surface shadow-sm transition-[transform,opacity] duration-300 ease-out ${
              shown
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}
          >
            <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Suspense fallback={<SearchSkeleton compact />}>
                  <Search compact autoFocus onClose={() => setOpen(false)} />
                </Suspense>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Затвори търсене"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-paper-muted transition-colors hover:bg-paper-surface-muted hover:text-paper-heading"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DesktopNav({ categories }: { categories: FlatCategory[] }) {
  const sectionByHandle = new Map(MAIN_MENU_SECTIONS.map((s) => [s.handle, s]));

  return (
    <ul className="mt-2 hidden w-full items-center justify-center gap-x-5 overflow-visible border-t border-paper-surface-dark/45 pt-2.5 lg:flex xl:gap-x-8">
      {FIXED_MENU.map((item) => {
        const handle = collectionFromPath(item.path);
        const section = handle
          ? sectionByHandle.get(
              handle as (typeof MAIN_MENU_SECTIONS)[number]["handle"],
            )
          : null;

        if (section) {
          return (
            <CategoryNavItem
              key={item.path}
              title={item.title}
              href={item.path}
              rootHandle={section.handle}
              categories={categories}
            />
          );
        }

        return (
          <li key={item.path} className="group">
            <NavLink href={item.path} title={item.title} />
          </li>
        );
      })}
    </ul>
  );
}

export function NavbarClient() {
  const [categories, setCategories] = useState<FlatCategory[]>([]);

  useEffect(() => {
    fetch("/api/collections", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setCategories(
          data.map((c: any) => ({
            id: c.id,
            handle: c.handle,
            title: c.title,
            description: c.description,
            position: c.position ?? 0,
            parent_id: c.parentId ?? c.parent_id ?? null,
          })),
        );
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <header className="sticky top-0 z-40 overflow-visible border-b border-paper-border-strong/70 bg-paper-surface">
      <nav className="relative z-10 mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 lg:py-3">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            prefetch={true}
            className="flex shrink-0 items-center"
            aria-label="PaperOK — начална страница"
          >
            <SiteLogo
              priority
              responsive
              className="h-11 w-auto sm:h-14 md:h-16 lg:h-[4.25rem] xl:h-[4.75rem]"
            />
          </Link>

          <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
            <div className="hidden md:block">
              <Suspense fallback={<SearchSkeleton compact />}>
                <Search compact />
              </Suspense>
            </div>
            <div className="md:hidden">
              <SearchToggle />
            </div>
            <CartModal />
            <div className="lg:hidden">
              <Suspense fallback={null}>
                <MobileMenu menu={[...FIXED_MENU]} categories={categories} />
              </Suspense>
            </div>
          </div>
        </div>

        <Suspense fallback={null}>
          <DesktopNav categories={categories} />
        </Suspense>
      </nav>
    </header>
  );
}
