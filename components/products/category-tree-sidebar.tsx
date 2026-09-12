"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import type { CategoryNode } from "lib/category-tree";
import { MAIN_MENU_SECTIONS } from "lib/constants";

function containsHandle(node: CategoryNode, handle: string): boolean {
  if (node.handle === handle) return true;
  return node.children.some((child) => containsHandle(child, handle));
}

function collectAncestorIds(
  nodes: CategoryNode[],
  handle: string,
  trail: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.handle === handle) return trail;
    const found = collectAncestorIds(node.children, handle, [
      ...trail,
      node.id,
    ]);
    if (found) return found;
  }
  return null;
}

function CategoryTreeItem({
  node,
  currentHandle,
  depth = 0,
  forcedOpenIds,
}: {
  node: CategoryNode;
  currentHandle?: string;
  depth?: number;
  forcedOpenIds: Set<string>;
}) {
  const hasChildren = node.children.length > 0;
  const isActive = currentHandle === node.handle;
  const isAncestor =
    !!currentHandle && !isActive && containsHandle(node, currentHandle);
  const [open, setOpen] = useState(
    () => depth === 0 || forcedOpenIds.has(node.id) || isActive || isAncestor,
  );

  useEffect(() => {
    if (forcedOpenIds.has(node.id) || isActive || isAncestor) {
      setOpen(true);
    }
  }, [forcedOpenIds, node.id, isActive, isAncestor]);

  const linkClass = clsx(
    "paper-cat-link",
    depth === 0 && "paper-cat-link-root",
    isActive && "is-active",
    isAncestor && "is-ancestor",
  );

  /** Collapsed parent: expand. Expanded (or leaf): go to collection. */
  const titleControl =
    hasChildren && !open ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={linkClass}
        aria-expanded={false}
      >
        <span className="paper-cat-link-text">{node.title}</span>
      </button>
    ) : (
      <Link
        href={`/products?collection=${node.handle}`}
        className={linkClass}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="paper-cat-link-text">{node.title}</span>
      </Link>
    );

  return (
    <li
      className={clsx(
        "paper-cat-node",
        depth > 0 && "paper-cat-node-nested",
        hasChildren && open && "is-open",
      )}
    >
      <div className="paper-cat-row">
        {hasChildren ? (
          <button
            type="button"
            className="paper-cat-toggle"
            aria-expanded={open}
            aria-label={open ? `Свий ${node.title}` : `Разгъни ${node.title}`}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronRightIcon
              className={clsx(
                "h-3.5 w-3.5 transition-transform duration-200",
                open && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="paper-cat-leaf-dot" aria-hidden />
        )}
        {titleControl}
      </div>

      {hasChildren && open && (
        <ul className="paper-cat-branch" role="group">
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              currentHandle={currentHandle}
              depth={depth + 1}
              forcedOpenIds={forcedOpenIds}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CategoryTreeSidebar({
  tree,
  currentHandle,
}: {
  tree: CategoryNode[];
  currentHandle?: string;
}) {
  const mainHandles = new Set<string>(MAIN_MENU_SECTIONS.map((s) => s.handle));

  const rootForCurrent = currentHandle
    ? tree.find((root) => containsHandle(root, currentHandle))
    : null;

  const displayTree = rootForCurrent
    ? [rootForCurrent]
    : tree.filter((node) => mainHandles.has(node.handle));

  const forcedOpenIds = new Set(
    currentHandle
      ? collectAncestorIds(displayTree, currentHandle) ?? []
      : [],
  );

  return (
    <nav aria-label="Категории" className="paper-cat-tree">
      <ul className="paper-cat-root-list" role="tree">
        {displayTree.map((node) => (
          <CategoryTreeItem
            key={node.id}
            node={node}
            currentHandle={currentHandle}
            depth={0}
            forcedOpenIds={forcedOpenIds}
          />
        ))}
      </ul>
    </nav>
  );
}
