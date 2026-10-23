"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

type ProductGalleryProps = {
  images: ProductImage[];
  name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const list = images.length > 0 ? images : [{ url: "/products/smartphone.jpg", alt: name, sortOrder: 0 }];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)]!;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-tm border border-tm-border bg-tm-surface-sunken">
        <Image
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2">
          {list.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Фото ${index + 1}`}
              className={`relative h-16 w-20 overflow-hidden rounded-tm-sm border ${
                index === active
                  ? "border-tm-accent"
                  : "border-tm-border hover:border-tm-border-strong"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
