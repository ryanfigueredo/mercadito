"use client";
import { useState } from "react";

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
  return (
    <div className="mt-3">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 pr-4">
          {banners.map((b, i) => (
            <div
              key={b.id}
              onMouseEnter={() => setIndex(i)}
              className={`h-56 w-[360px] shrink-0 rounded-2xl ${b.color} grid place-items-center`}
            >
              <span className="text-lg font-medium">{b.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {banners.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === index ? "bg-brand-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
