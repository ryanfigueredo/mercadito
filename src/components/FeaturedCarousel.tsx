"use client";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

const banners = [
  {
    id: 1,
    color: "bg-gradient-to-br from-[#F8B075] to-[#e69a66]",
    title: "Essenciais",
    subtitle: "Produtos básicos do dia a dia",
    category: "Grãos",
  },
  {
    id: 2,
    color: "bg-gradient-to-br from-[#4ade80] to-[#22c55e]",
    title: "Hortifruti",
    subtitle: "Frutas e verduras fresquinhas",
    category: "Hortifruti",
  },
  {
    id: 3,
    color: "bg-gradient-to-br from-[#60a5fa] to-[#3b82f6]",
    title: "Bebidas",
    subtitle: "Refrescantes e saborosas",
    category: "Bebidas",
  },
  {
    id: 4,
    color: "bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6]",
    title: "Limpeza",
    subtitle: "Casa sempre limpa",
    category: "Limpeza",
  },
];

export default function FeaturedCarousel() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rotação automática a cada 5 segundos com pause no hover
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (slideIndex: number) => {
    setIndex(slideIndex);
  };

  return (
    <div className="mt-3">
      <div
        className="overflow-hidden rounded-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className={`h-56 w-full shrink-0 ${
                banner.color
              } p-6 flex flex-col justify-center cursor-pointer hover:scale-[1.01] transition-all duration-300 ${
                i === 0
                  ? "rounded-l-2xl"
                  : i === banners.length - 1
                  ? "rounded-r-2xl"
                  : ""
              }`}
              onClick={() => {
                // Filtrar por categoria quando clicar no banner
                const event = new CustomEvent("filterByCategory", {
                  detail: { category: banner.category },
                });
                window.dispatchEvent(event);
              }}
            >
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">{banner.title}</h3>
                <p className="text-white/90 text-sm mb-4">{banner.subtitle}</p>
                <div className="inline-flex items-center text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                  Ver produtos <ArrowRight className="ml-2" size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? "bg-[#F8B075] w-6 scale-110"
                : "bg-gray-300 w-2 hover:bg-gray-400"
            }`}
            aria-label={`Ir para banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
