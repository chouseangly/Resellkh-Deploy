import Image from "next/image";

export default function DailyBanner() {
  return (
    <section className="w-full bg-[#f7f2f5] py-10 rounded-[40px] mb-7">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 font-quicksand px-4">
        {/* Text Section */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-[15px] md:text-[20px] lg:text-[25px] font-bold text-gray-900 leading-snug mb-4">
            Your daily resell marketplace — shop
            <br className="hidden sm:block" />
            or sell second-hand today.
            <br className="hidden sm:block" />
            All from home, all with <span className="text-orange-500">ReSellKH</span>
          </h2>
          <p className="text-[14px] sm:text-[16px] md:text-[18px] text-gray-500 font-medium">
            Start your daily shopping with <span className="text-orange-500 font-semibold">ReSellKH</span>
          </p>
        </div>

        {/* Image Section - FIX APPLIED HERE */}
        <div className="w-full lg:w-[480px] h-[240px] md:h-[280px] lg:h-[300px] relative">
          <div className="absolute top-0 left-0 md:left-10 lg:left-12 rounded-3xl overflow-hidden shadow-md w-[150px] h-[150px] md:w-[180px] md:h-[180px] lg:w-[190px] lg:h-[190px]">
            <Image
              src="/images/banner/banner1.jpg"
              alt="bg1"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 md:right-10 lg:right-12 rounded-3xl overflow-hidden shadow-md w-[150px] h-[150px] md:w-[180px] md:h-[180px] lg:w-[190px] lg:h-[190px]">
            <Image
              src="/images/banner/banner2.jpg"
              alt="bg2"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-3xl overflow-hidden shadow-lg w-[150px] h-[150px] md:w-[180px] md:h-[180px] lg:w-[200px] lg:h-[200px] z-10">
            <Image
              src="/images/banner/banner3.jpg"
              alt="bg3"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}