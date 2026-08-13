"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { CategoryNode } from "lib/category-tree";
import { MAIN_MENU_SECTIONS } from "lib/constants";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { DeleteCollectionButton } from "./delete-collection-button";
import { VisibilityStatusBadge } from "./visibility-status-badge";

function isMainMenuRoot(node: CategoryNode, depth: number) {
  return (
    depth === 0 &&
    MAIN_MENU_SECTIONS.some((section) => section.handle === node.handle)
  );
}

function CategoryTreeRow({
  node,
  depth,
  mainMenuTitle,
  collapsedRoots,
  onToggleRoot,
}: {
  node: CategoryNode;
  depth: number;
  mainMenuTitle: string;
  collapsedRoots: Set<string>;
  onToggleRoot: (rootId: string) => void;
}) {
  const indent = depth * 24;
  const hasChildren = node.children.length > 0;
  const collapsible = isMainMenuRoot(node, depth) && hasChildren;
  const isCollapsed = collapsible && collapsedRoots.has(node.id);

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
        <td className="px-6 py-4">
          <div
            className="flex items-center gap-1.5"
            style={{ paddingLeft: `${indent}px` }}
          >
            {collapsible ? (
              <button
                type="button"
                onClick={() => onToggleRoot(node.id)}
                aria-expanded={!isCollapsed}
                aria-label={
                  isCollapsed
                    ? `Разгъни ${node.title}`
                    : `Свий ${node.title}`
                }
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              >
                <ChevronRightIcon
                  className={clsx(
                    "h-4 w-4 transition-transform duration-200",
                    !isCollapsed && "rotate-90",
                  )}
                />
              </button>
            ) : depth > 0 ? (
              <span
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-gray-400 dark:text-gray-500"
                aria-hidden
              >
                └
              </span>
            ) : (
              <span className="inline-block h-7 w-7 shrink-0" aria-hidden />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {node.title}
            </span>
            {collapsible && hasChildren && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({node.children.length})
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-mono text-sm text-gray-500 dark:text-gray-400">
            {node.handle}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {depth === 0 ? (
            <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
              Главно меню
            </span>
          ) : (
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {mainMenuTitle}
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {node.position}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <VisibilityStatusBadge active={node.available === true} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex gap-2">
            <Link
              href={`/admin/collections/${node.id}`}
              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
            >
              Редактирай
            </Link>
            <DeleteCollectionButton
              collectionId={node.id}
              collectionTitle={node.title}
            />
          </div>
        </td>
      </tr>
      {!isCollapsed &&
        node.children.map((child) => (
          <CategoryTreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            mainMenuTitle={mainMenuTitle}
            collapsedRoots={collapsedRoots}
            onToggleRoot={onToggleRoot}
          />
        ))}
    </>
  );
}

export function CategoryTreeTable({ tree }: { tree: CategoryNode[] }) {
  const mainMenuRootIds = useMemo(
    () =>
      tree
        .filter((node) => isMainMenuRoot(node, 0) && node.children.length > 0)
        .map((node) => node.id),
    [tree],
  );

  const [collapsedRoots, setCollapsedRoots] = useState<Set<string>>(
    () => new Set(),
  );

  const onToggleRoot = (rootId: string) => {
    setCollapsedRoots((prev) => {
      const next = new Set(prev);
      if (next.has(rootId)) {
        next.delete(rootId);
      } else {
        next.add(rootId);
      }
      return next;
    });
  };

  const collapseAll = () => {
    setCollapsedRoots(new Set(mainMenuRootIds));
  };

  const expandAll = () => {
    setCollapsedRoots(new Set());
  };

  if (tree.length === 0) {
    return (
      <tr>
        <td
          colSpan={6}
          className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
        >
          Няма категории. Създай първата категория!
        </td>
      </tr>
    );
  }

  return (
    <>
      {mainMenuRootIds.length > 0 && (
        <tr className="bg-gray-50/80 dark:bg-gray-900/50">
          <td colSpan={6} className="px-6 py-2">
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>Главни категории:</span>
              <button
                type="button"
                onClick={expandAll}
                className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                Разгъни всички
              </button>
              <span aria-hidden>·</span>
              <button
                type="button"
                onClick={collapseAll}
                className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                Свий всички
              </button>
            </div>
          </td>
        </tr>
      )}
      {tree.map((node) => (
        <CategoryTreeRow
          key={node.id}
          node={node}
          depth={0}
          mainMenuTitle={node.title}
          collapsedRoots={collapsedRoots}
          onToggleRoot={onToggleRoot}
        />
      ))}
    </>
  );
}
