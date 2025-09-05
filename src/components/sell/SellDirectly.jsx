'use client';
import Image from 'next/image';
import Link from 'next/link';

const directSellCategories = [
  {
    name: "Men’s & Women’s Fashion",
    description: "clean out your closet",
    icon: "/Sell/fashion.png",
    href: "#",
  },
  {
    name: "Accessories Women Luxury",
    description: "beauty",
    icon: "/Sell/beauty.png",
    href: "#",
  },
  {
    name: "Decathlon bicycles",
    description: "instant quotest",
    icon: "/Sell/bicycle.png",
    href: "#",
  },
  {
    name: "Book",
    description: "grow smart",
    icon: "/Sell/book.png",
    href: "#",
  },
  {
    name: "Spot",
    description: "have lots of categories of sport",
    icon: "/Sell/sport.png",
    href: "#",
  },
  {
    name: "Furniture",
    description: "Home service",
    icon: "/Sell/furniture.png",
    href: "#",
  },
];

export default function SellDirectly() {
  return (
    <div className="bg-[#E4E4E4] p-4 sm:p-6 rounded-3xl shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
        {directSellCategories.map((category) => (
          <Link
            href={category.href}
            key={category.name}
            className="flex items-center space-x-4 hover:opacity-90 transition-opacity"
          >
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={category.icon}
                alt={category.name}
                width={80}
                height={80}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="text-start">
              <h3 className="font-semibold text-base text-gray-900 sm:text-[17px]">{category.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
