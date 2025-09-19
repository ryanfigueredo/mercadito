"use client";
import { useState } from "react";

const banners = [
  {
    id: 1,
    gradient: "bg-gradient-to-r from-brand-500 to-brand-600",
    title: "Voucher imperdível",
    subtitle: "Até 50% OFF",
    icon: "🎁",
  },
  { 
    id: 2, 
    gradient: "bg-gradient-to-r from-accent-500 to-accent-600", 
    title: "Frete grátis", 
    subtitle: "Acima de R$ 50",
    icon: "🚚",
  },
  { 
    id: 3, 
    gradient: "bg-gradient-to-r from-info to-blue-500", 
    title: "Combos da semana", 
    subtitle: "Economia garantida",
    icon: "🍽️",
  },
  { 
    id: 4, 
    gradient: "bg-gradient-to-r from-warning to-orange-500", 
    title: "Descontos progressivos", 
    subtitle: "Quanto mais, mais barato",
    icon: "💰",
  },
];

export default function FeaturedCarousel() {
  const [index, setIndex] = useState(0);
  return (
    <div className="mt-3">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-4 pr-4">
          {banners.map((b, i) => (
            <div
              key={b.id}
              onMouseEnter={() => setIndex(i)}
              className={`h-48 w-[280px] shrink-0 rounded-xl ${b.gradient} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
            >
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{b.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold">{b.title}</h3>
                    <p className="text-sm opacity-90">{b.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <span>Saiba mais</span>
                  <span>→</span>
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
            onClick={() => setIndex(i)}
            className={`h-2 w-6 rounded-full transition-all duration-200 ${
              i === index ? "bg-brand-600" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
