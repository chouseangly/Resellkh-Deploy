import Image from "next/image";

export default function Banner() {
  return (
    <section className="w-full py-[80] ">
      <div className="max-w-auto mx-auto flex flex-col md:flex-row items-start justify-between gap-[45] ">
        <div className="w-full md:w-1/2 lg:w-[70%] text-center md:text-left">
          <h1 className="text-[27px] lg:text-[35px] md:text-[24px] font-bold text-gray-900 leading-tight mb-3">
            We help you shop smarter
          </h1>
          <h2 className="text-[20px] lg:text-[28px] md:text-[19px] ps-[50px] lg:ps-[160px] font-bold text-orange-500 font-[Poppins] mb-6 text-left ml-4 md:ml-20">
            one resold product at a time.
          </h2>

          <p className="text-[16px] lg:text-[16px] md:text-[13px] text-gray-600 leading-relaxed max-w-full mx-auto md:mx-0">
            Cambodia’s trusted online marketplace where buying and selling is
            fast, easy, and secure. Whether you're looking to declutter your
            home, start a side hustle, or find great deals on quality new and
            used products, ReSellKH is the perfect platform for you.
          </p>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end gap-4 pe-[1%] md:pe-[2%] lg:pe-[1.5%]">
          <div className="flex flex-col gap-4">
            <Image
              src="/images/banner/hero1.jpg"
              alt="Scan"
              width={100}
              height={120}
              className="rounded-xl object-cover w-[100px] h-[120px]"
            />
            <Image
              src="/images/banner/hero2.jpg"
              alt="Clothes"
              width={100}
              height={120}
              className="rounded-xl object-cover w-[100px] h-[120px]"
            />
          </div>
          <div className="relative w-[240px] h-[240px]">
            <div className="absolute top-[-30px] left-[20px] rounded-[24px] w-full h-full z-0 overflow-hidden">
              <Image
                src="/images/banner/hero4.jpg"
                alt="Blurred bg"
                fill
                className="object-cover blur-[1%] "
              />
            </div>
             <div className="absolute top-[10px] right-[9px] w-full h-full z-10 overflow-hidden">
            <Image
              src="/images/banner/hero3.jpg"
              alt="Main"
              fill
              className=" object-cover left-3 rounded-xl z-10 shadow-lg"
            />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
