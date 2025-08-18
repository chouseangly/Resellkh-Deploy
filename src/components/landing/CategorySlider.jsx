"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Static data for the categories
const categories = [
  { id: 5, name: "Fashion", image: "/images/category/fashion.png" },
  { id: 1, name: "Accessories", image: "/images/category/Accessories.png" },
  { id: 3, name: "Shoes & Bags", image: "/images/category/Shoes.png" },
  { id: 2, name: "Beauty", image: "/images/category/Beauty.png" },
  { id: 4, name: "Book", image: "/images/category/Book.png" },
  { id: 6, name: "Home", image: "/images/category/Home.png" },
  { id: 7, name: "Sports & Kids", image: "/images/category/sport.png" },
  { id: 8, name: "Electronic", image: "/images/category/Electronic.png" },
  { id: 9, name: "Vehicle", image: "/images/category/Bike.png" },
];

export default function CategorySlider() {
  const scrollRef = useRef(null);

  // This updated scroll function is responsive. It scrolls by the visible width 
  // of the container, providing a consistent experience on all screen sizes.
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full pt-8 md:pt-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex justify-between items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            What would you like to find?
          </h2>
          {/* Scroll Arrows with improved styling */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
              aria-label="Scroll right"
            >
              <FiChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Scrollable Category Cards Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar -mx-2"
        >
          {categories.map((cat) => (
            // Each card wrapper now uses responsive, percentage-based widths.
            // e.g., 3 cards on mobile, 4 on tablet, 7 on desktop.
            <div key={cat.id} className="flex-shrink-0 w-1/3 sm:w-1/4 md:w-1/6 lg:w-[14.28%] p-2 snap-start">
              <Link href={`/category/${cat.id}`} className="block">
                {/* The card itself uses aspect-square to maintain a perfect square shape */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 16vw, 14vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/170x170/e2e8f0/9ca3af?text=Img'; }}
                  />
                  {/* Text overlay with a subtle gradient for better readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center p-3 transition-all duration-300 group-hover:from-black/70">
                    <span className="text-white text-sm font-semibold text-center drop-shadow-md">
                      {cat.name}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
