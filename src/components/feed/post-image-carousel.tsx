"use client";

import { useState } from "react";

type PostImageCarouselProps = {
  imageUrls: string[];
};

export function PostImageCarousel({ imageUrls }: PostImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeImages = imageUrls.filter(Boolean);

  if (safeImages.length === 0) return null;

  if (safeImages.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt="" className="mt-1.5 aspect-video w-full object-cover" src={safeImages[0]} />
    );
  }

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, safeImages.length - 1)));
  };

  return (
    <div className="mt-1.5 overflow-hidden bg-[#0c0c18]">
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {safeImages.map((imageUrl) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="max-h-[420px] min-w-full flex-shrink-0 object-cover"
              key={imageUrl}
              src={imageUrl}
            />
          ))}
        </div>
        <button
          aria-label="Previous image"
          className="absolute left-2.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-black/55 text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-30"
          disabled={currentIndex === 0}
          onClick={() => goTo(currentIndex - 1)}
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <polyline
              points="15 18 9 12 15 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
        </button>
        <button
          aria-label="Next image"
          className="absolute right-2.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-black/55 text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-30"
          disabled={currentIndex === safeImages.length - 1}
          onClick={() => goTo(currentIndex + 1)}
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <polyline
              points="9 18 15 12 9 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
        </button>
      </div>
      <div className="flex justify-center gap-[5px] bg-black py-1.5">
        {safeImages.map((imageUrl, index) => (
          <button
            aria-label={`Show image ${index + 1}`}
            className={`h-1.5 w-1.5 cursor-pointer rounded-full border-0 p-0 transition ${
              currentIndex === index ? "bg-white" : "bg-white/40"
            }`}
            key={imageUrl}
            onClick={() => goTo(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
