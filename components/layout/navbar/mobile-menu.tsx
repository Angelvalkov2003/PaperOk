"use client";

import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { SiteLogo } from "components/site-logo";
import {
  buildCategoryTree,
  type CategoryNode,
  type FlatCategory,
} from "lib/category-tree";
import {
  FACEBOOK_URL,
  FIXED_MENU,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  MAIN_MENU_SECTIONS,
  TIKTOK_URL,
  YOUTUBE_URL,
  type MenuItem,
} from "lib/constants";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, Suspense, useEffect, useState } from "react";
import Search, { SearchSkeleton } from "./search";

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-paper-border-strong/80 bg-paper-surface-muted/60 text-paper-heading transition-colors hover:border-paper-green hover:text-paper-green"
    >
      {children}
    </a>
  );
}

function collectionFromPath(path: string): string | null {
  if (!path.includes("collection=")) return null;
  return new URLSearchParams(path.split("?")[1] || "").get("collection");
}

function containsHandle(node: CategoryNode, handle: string): boolean {
  if (node.handle === handle) return true;
  return node.children.some((child) => containsHandle(child, handle));
}

const NEST_PANELS = [
  "mt-1.5 space-y-0.5 rounded-xl border-l-[3px] border-paper-green/70 bg-paper-accent-bg/60 py-1.5 pl-2.5 pr-1",
  "mt-1 space-y-0.5 rounded-lg border-l-[3px] border-paper-green/45 bg-paper-section/80 py-1 pl-2 pr-0.5",
  "mt-1 space-y-0.5 rounded-lg border-l-2 border-paper-green/30 bg-paper-surface-muted/90 py-0.5 pl-2",
] as const;

function nestPanelClass(depth: number) {
  return NEST_PANELS[Math.min(depth, NEST_PANELS.length - 1)];
}

function MobileTreeNode({
  node,
  onNavigate,
  current,
  depth = 0,
}: {
  node: CategoryNode;
  onNavigate: () => void;
  current: string | null;
  depth?: number;
}) {
  const hasChildren = node.children.length > 0;
  const isActive = current === node.handle;
  const isAncestor = !!current && !isActive && containsHandle(node, current);
  const [expanded, setExpanded] = useState(isActive || isAncestor);

  useEffect(() => {
    if (isActive || isAncestor) {
      setExpanded(true);
    }
  }, [isActive, isAncestor]);

  const textSize = depth === 0 ? "text-[16px]" : "text-[15px]";

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={`/products?collection=${node.handle}`}
          onClick={onNavigate}
          className={`block rounded-lg px-2.5 py-2.5 font-medium tracking-wide transition-colors ${textSize} ${
            isActive
              ? "bg-paper-white/70 text-paper-green"
              : "text-paper-text hover:bg-paper-white/50 hover:text-paper-green"
          }`}
        >
          {node.title}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div
        className={`flex w-full items-center justify-between gap-1 rounded-lg px-2.5 ${
          expanded || isActive ? "bg-paper-white/55" : ""
        }`}
      >
        <Link
          href={`/products?collection=${node.handle}`}
          onClick={onNavigate}
          className={`min-w-0 flex-1 py-2.5 text-left font-medium tracking-wide transition-colors ${textSize} ${
            isActive
              ? "text-paper-green"
              : "text-paper-heading hover:text-paper-green"
          }`}
        >
          {node.title}
        </Link>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`${node.title} — подкатегории`}
          onClick={() => setExpanded((v) => !v)}
          className={`flex shrink-0 items-center justify-center py-2.5 transition-colors ${
            expanded || isActive
              ? "text-paper-green"
              : "text-paper-heading hover:text-paper-green"
          }`}
        >
          <ChevronDownIcon
            className={`h-5 w-5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {expanded && (
        <ul className={nestPanelClass(depth + 1)}>
          {node.children.map((child) => (
            <MobileTreeNode
              key={child.id}
              node={child}
              onNavigate={onNavigate}
              current={current}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function MobileMenuItem({
  item,
  categories,
  onNavigate,
  menuOpen,
}: {
  item: MenuItem;
  categories: FlatCategory[];
  onNavigate: () => void;
  menuOpen: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const handle = collectionFromPath(item.path);
  const tree = buildCategoryTree(categories);
  const root = handle ? tree.find((n) => n.handle === handle) : null;
  const children = root?.children ?? [];

  const current = searchParams.get("collection");
  const isActive =
    !!handle &&
    pathname === "/products" &&
    !!current &&
    (current === handle || (!!root && containsHandle(root, current)));

  useEffect(() => {
    if (menuOpen && isActive) {
      setExpanded(true);
    }
  }, [menuOpen, isActive]);

  const seeAllLabel = `Виж всички ${item.title.toLowerCase()}`;

  return (
    <li className={expanded ? "mb-2 pb-2" : undefined}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3.5 text-left text-[17px] font-semibold tracking-wide transition-colors ${
          isActive || expanded
            ? "bg-paper-accent-bg text-paper-green"
            : "text-paper-heading hover:bg-paper-surface-muted/70 hover:text-paper-green"
        }`}
      >
        <span>{item.title}</span>
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <ul className={nestPanelClass(0)}>
          <li>
            <Link
              href={item.path}
              prefetch={true}
              onClick={onNavigate}
              className={`block rounded-lg px-2.5 py-2.5 text-[15px] font-medium transition-colors ${
                current === handle
                  ? "bg-paper-white/70 text-paper-green"
                  : "text-paper-muted hover:bg-paper-white/50 hover:text-paper-green"
              }`}
            >
              {seeAllLabel}
            </Link>
          </li>
          {children.map((child) => (
            <MobileTreeNode
              key={child.id}
              node={child}
              onNavigate={onNavigate}
              current={current}
              depth={0}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function MobileMenu({
  menu = [...FIXED_MENU],
  categories = [],
}: {
  menu?: MenuItem[];
  categories?: FlatCategory[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  const sectionHandles = new Set(MAIN_MENU_SECTIONS.map((s) => s.handle));

  return (
    <>
      <button
        type="button"
        onClick={openMobileMenu}
        aria-label="Отвори меню"
        className="flex h-10 w-10 items-center justify-center rounded-full text-paper-text transition-colors hover:bg-paper-surface-muted hover:text-paper-green lg:hidden"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-paper-heading/25" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-transform ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 right-0 flex h-full w-full max-w-sm flex-col overflow-hidden bg-paper-surface shadow-xl">
              <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
                <div className="mb-6 flex items-center justify-between">
                  <SiteLogo height={36} />
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-paper-text transition-colors hover:bg-paper-surface-muted"
                    onClick={closeMobileMenu}
                    aria-label="Затвори меню"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 w-full">
                  <Suspense fallback={<SearchSkeleton compact />}>
                    <Search compact />
                  </Suspense>
                </div>

                <ul className="flex w-full flex-col gap-1">
                  {menu.map((item) => {
                    const handle = collectionFromPath(item.path);
                    const isMainSection = handle && sectionHandles.has(handle as any);

                    if (isMainSection) {
                      return (
                        <MobileMenuItem
                          key={item.path}
                          item={item}
                          categories={categories}
                          onNavigate={closeMobileMenu}
                          menuOpen={isOpen}
                        />
                      );
                    }

                    const isActive =
                      item.path === "/"
                        ? pathname === "/"
                        : pathname === item.path ||
                          pathname.startsWith(`${item.path}/`);

                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          prefetch={true}
                          onClick={closeMobileMenu}
                          className={`block rounded-xl px-3 py-3.5 text-[17px] font-medium tracking-wide transition-colors ${
                            isActive
                              ? "bg-paper-surface-muted text-paper-green"
                              : "text-paper-heading hover:bg-paper-surface-muted/70 hover:text-paper-green"
                          }`}
                        >
                          {item.title}
                          {isActive && (
                            <span className="mt-1 block h-0.5 w-8 rounded-full bg-paper-green" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="relative z-10 mt-auto border-t border-paper-border-strong/70 px-5 py-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-paper-muted">
                  Последвай ни
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <SocialIcon href={FACEBOOK_URL} label="Facebook">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </SocialIcon>
                  <SocialIcon href={INSTAGRAM_URL} label="Instagram">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </SocialIcon>
                  <SocialIcon href={YOUTUBE_URL} label="YouTube">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </SocialIcon>
                  <SocialIcon href={TIKTOK_URL} label="TikTok">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </SocialIcon>
                  <SocialIcon href={LINKEDIN_URL} label="LinkedIn">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </SocialIcon>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
