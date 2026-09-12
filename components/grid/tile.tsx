"use client";

import clsx from "clsx";
import Image from "next/image";
import { memo } from "react";
import Label from "../label";

export const GridTileImage = memo(function GridTileImage({
  isInteractive = true,
  active,
  label,
  className,
  unoptimized,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    compareAtAmount?: string;
    currencyCode: string;
    position?: "bottom" | "center";
  };
} & React.ComponentProps<typeof Image>) {
  const src = typeof props.src === "string" ? props.src : "";
  const isLocalPlaceholder =
    src.startsWith("/placeholder") || src.endsWith(".svg");

  return (
    <div
      className={clsx(
        "group relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-paper-bg hover:border-paper-border",
        {
          "border-2 border-paper-border": active,
          "border-paper-border": !active,
        },
      )}
    >
      {props.src ? (
        <Image
          {...props}
          unoptimized={isLocalPlaceholder || unoptimized}
          className={clsx(
            "relative h-full w-full object-contain",
            isInteractive &&
              "transition duration-300 ease-in-out group-hover:scale-105",
            className,
          )}
        />
      ) : null}
      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          compareAtAmount={label.compareAtAmount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
});
