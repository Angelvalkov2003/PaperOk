"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import {
  BUSINESS_GRID_CLASS,
  BUSINESS_GRID_REVEAL_CLASS,
  BusinessCard,
  BusinessCardText,
  BusinessCardTitle,
} from "components/za-biznesa/business-card";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import Image from "next/image";
import { useState } from "react";

const CARD_BG = PAPER_BACKGROUNDS.petalsSoft;

const projects = [
  {
    title: "Корпоративни картички за Gianni Shoes",
    description:
      "200 картички за 8 март, размер 70 × 65 мм, отпечатани върху семенна хартия.",
    images: [
      "/projects/Gianni/IMG_0181.JPG",
      "/projects/Gianni/IMG_0182.JPG",
      "/projects/Gianni/IMG_0183.JPG",
      "/projects/Gianni/IMG_0184.JPG",
    ],
  },
  {
    title: "Корпоративни картички за Yves Rocher България",
    description:
      "1000 картички, размер 50 × 70 мм, изработени от микс цветна семенна хартия.",
    images: [
      "/projects/yvesrocher/IMG_0185.JPG",
      "/projects/yvesrocher/IMG_0186.JPG",
      "/projects/yvesrocher/IMG_0187.JPG",
      "/projects/yvesrocher/IMG_0188.JPG",
    ],
  },
  {
    title: "Корпоративни картички за Home of Wool България",
    description:
      "500 персонализирани картички от семенна хартия, размер 143 × 65 мм.",
    images: [
      "/projects/homewool/IMG_0190.JPG",
      "/projects/homewool/IMG_0191.JPG",
      "/projects/homewool/IMG_0192.JPG",
      "/projects/homewool/IMG_0193.JPG",
    ],
  },
  {
    title: "Корпоративни картички за DUPISSIMA Wellness Center",
    description:
      "1000 персонализирани картички от семенна хартия, размер 100 × 143 мм.",
    images: [
      "/projects/DUPISSIMAWellness/IMG_0194.JPG",
      "/projects/DUPISSIMAWellness/IMG_0195.JPG",
      "/projects/DUPISSIMAWellness/IMG_0196.JPG",
    ],
  },
  {
    title: "Корпоративни материали за Kirana Official",
    description:
      "300 персонализирани картички от семенна хартия – размер 100 × 143 мм\n100 визитки от семенна хартия – размер 90 × 50 мм",
    images: [
      "/projects/karana/IMG_0204.JPG",
      "/projects/karana/IMG_0200.JPG",
      "/projects/karana/IMG_0202.JPG",
    ],
  },
  {
    title: "Корпоративни материали за OurPlaceZornitsa",
    description:
      "300 визитки от семенна хартия, размер 90 × 50 мм, и 100 информационни картички, размер 143 × 100 мм.",
    images: [
      "/projects/ourplacezornitsa/IMG_0205.JPG",
      "/projects/ourplacezornitsa/IMG_0207.JPG",
      "/projects/ourplacezornitsa/IMG_0209.JPG",
    ],
  },
];

function ProjectGallery({
  title,
  images,
}: {
  title: string;
  images: string[];
}) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  const hasMany = images.length > 1;

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + images.length) % images.length);
  };

  return (
    <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-paper-section">
      {current && (
        <Image
          src={current}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="img-zoom object-cover"
        />
      )}

      {hasMany && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Предишна снимка"
            className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper-white/85 text-paper-heading shadow-sm transition-colors hover:bg-paper-white"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Следваща снимка"
            className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper-white/85 text-paper-heading shadow-sm transition-colors hover:bg-paper-white"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Снимка ${i + 1}`}
                onClick={() => setIndex(i)}
                className={clsx(
                  "h-2 rounded-full transition-all",
                  i === index
                    ? "w-5 bg-paper-green"
                    : "w-2 bg-paper-white/80 hover:bg-paper-white",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function BusinessProjects() {
  return (
    <section className="relative overflow-hidden bg-paper-bg py-16 md:py-20">
      <PaperTexture
        src={PAPER_BACKGROUNDS.fibers}
        overlay={PAPER_OVERLAYS.cream}
        sizes="100vw"
        quality={85}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
            Нашите проекти
          </h2>
        </Reveal>
        <div className={`${BUSINESS_GRID_CLASS} gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
          {projects.map((project, index) => (
            <Reveal
              key={project.title}
              delay={index * 80}
              variant="up"
              className={BUSINESS_GRID_REVEAL_CLASS}
            >
              <div className="hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-paper-border">
                <ProjectGallery title={project.title} images={project.images} />
                <BusinessCard
                  bare
                  textureSrc={CARD_BG}
                  textureSizes="(min-width: 1024px) 33vw, 50vw"
                  className="flex-1 border-t border-paper-border"
                >
                  <BusinessCardTitle lines={3} className="text-paper-heading">
                    {project.title}
                  </BusinessCardTitle>
                  <BusinessCardText className="min-h-[4.5rem] whitespace-pre-line">
                    {project.description}
                  </BusinessCardText>
                </BusinessCard>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
