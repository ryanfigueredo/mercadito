"use client";
import { useState, useEffect } from "react";

const banners = [
  {
    id: 1,
    color: "bg-gradient-to-br from-[#F8B075] to-[#e69a66]",
    title: "Essenciais",
    subtitle: "Produtos básicos do dia a dia",
    category: "Grãos",
    icon: "🌾",
  },
  {
    id: 2,
    color: "bg-gradient-to-br from-[#4ade80] to-[#22c55e]",
    title: "Hortifruti",
    subtitle: "Frutas e verduras fresquinhas",
    category: "Hortifruti",
    icon: "🥬",
  },
  {
    id: 3,
    color: "bg-gradient-to-br from-[#60a5fa] to-[#3b82f6]",
    title: "Bebidas",
    subtitle: "Refrescantes e saborosas",
    category: "Bebidas",
    icon: "🥤",
  },
  {
    id: 4,
    color: "bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6]",
    title: "Limpeza",
    subtitle: "Casa sempre limpa",
    category: "Limpeza",
    icon: "🧽",
  },
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
              className={`h-56 w-full shrink-0 rounded-2xl ${banner.color} p-6 flex flex-col justify-center cursor-pointer hover:scale-[1.02] transition-transform`}
              onClick={() => {
                // Filtrar por categoria quando clicar no banner
                const event = new CustomEvent("filterByCategory", {
                  detail: { category: banner.category },
                });
                window.dispatchEvent(event);
              }}
            >
              <div className="text-white">
                <div className="text-4xl mb-3">{banner.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{banner.title}</h3>
                <p className="text-white/90 text-sm">{banner.subtitle}</p>
                <div className="mt-4 inline-flex items-center text-sm font-medium">
                  Ver produtos <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-2 w-2 rounded-full transition-colors duration-200 ${
              i === index ? "bg-[#F8B075] scale-150" : "bg-gray-300"
            }`}
            aria-label={`Ir para banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
