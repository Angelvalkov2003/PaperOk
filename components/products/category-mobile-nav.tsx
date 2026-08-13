"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { findCategoryNode, type CategoryNode } from "lib/category-tree";
import { CategoryTreeSidebar } from "./category-tree-sidebar";

export function CategoryMobileNav({
  tree,
  currentHandle,
}: {
  tree: CategoryNode[];
  currentHandle?: string;
}) {
  const [treeOpen, setTreeOpen] = useState(false);
  const currentTitle = currentHandle
    ? findCategoryNode(tree, currentHandle)?.title
    : null;
  const label = currentTitle || "Всички продукти";

  return (
    <div className="mb-5 lg:hidden">
      <button
        type="button"
        onClick={() => setTreeOpen((open) => !open)}
        aria-expanded={treeOpen}
        className="flex w-full items-center justify-between rounded-xl border border-paper-border bg-paper-white/70 px-4 py-3 text-left text-sm font-medium text-paper-heading transition-colors hover:border-paper-green/40"
      >
        <span>{label}</span>
        <ChevronDownIcon
          className={clsx(
            "h-5 w-5 shrink-0 text-paper-muted transition-transform duration-200",
            treeOpen && "rotate-180",
          )}
        />
      </button>

      {treeOpen && (
        <div className="mt-2 rounded-xl border border-paper-border bg-paper-white/85 p-3 shadow-sm">
          <CategoryTreeSidebar tree={tree} currentHandle={currentHandle} />
        </div>
      )}
    </div>
  );
}
