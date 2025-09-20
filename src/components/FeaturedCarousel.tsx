"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const banners = [
  {
    id: 1,
    color: "bg-[#d7c4ff]",
    title: "Voucher imperdível",
  },
  { id: 2, color: "bg-[#ffd7ef]", title: "Frete grátis hoje" },
  { id: 3, color: "bg-[#d1f5ff]", title: "Combos da semana" },
  { id: 4, color: "bg-[#ffe8d3]", title: "Descontos progressivos" },
];

export default function FeaturedCarousel() {
  const [index, setIndex] = useState(0);

  // Rotação automática a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (slideIndex: number) => {
    setIndex(slideIndex);
  };

  return (
    <div className="mt-3">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`h-56 w-full shrink-0 rounded-2xl ${banner.color} grid place-items-center`}
            >
              <span className="text-lg font-medium">{banner.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {banners.map((_, i) => (
          <Button
            key={i}
            onClick={() => goToSlide(i)}
            variant="ghost"
            size="sm"
            className={`h-2 w-2 rounded-full p-0 transition-colors duration-200 ${
              i === index ? "bg-[#F8B075] scale-150" : "bg-[#e6e6e6]"
            }`}
            aria-label={`Ir para banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
