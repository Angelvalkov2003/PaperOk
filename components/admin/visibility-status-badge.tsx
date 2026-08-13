import clsx from "clsx";

export function VisibilityStatusBadge({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        active
          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
        className,
      )}
    >
      <span aria-hidden>{active ? "🟢" : "⚪"}</span>
      {active ? "Активен" : "Скрит"}
    </span>
  );
}
