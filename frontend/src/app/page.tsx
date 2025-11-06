"use client"
import React, { useEffect, useState } from "react";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import { TaxonomyType } from "@/data/types";
import SectionSliderNewCategories from "@/components/SectionSliderNewCategories";
import SectionOurFeatures from "@/components/SectionOurFeatures";
import BackgroundSection from "@/components/BackgroundSection";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import SectionGridCategoryBox from "@/components/SectionGridCategoryBox";
import SectionBecomeAnAuthor from "@/components/SectionBecomeAnAuthor";
import SectionVideos from "@/components/SectionVideos";
import SectionClientSay from "@/components/SectionClientSay";
import SectionBookingLookup from "@/components/SectionBookingLookup";
import { useRouter } from "next/navigation";
import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { useAppSelector } from "stores/hookStore";
import SearchModal from "@/app/(client-components)/(HeroSearchForm)/SearchModal";
import SectionHeroWithCarousel from "@/app/(home)/SectionHeroWithCarousel";

const DEMO_CATS: TaxonomyType[] = [
  {
    id: "1",
    href: "#",
    name: "Hà Nội",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/thumbnailhn-1621669931033.jpeg",
  },
  {
    id: "2",
    href: "#",
    name: "TP.Hồ Chí Minh",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://images.pexels.com/photos/941195/pexels-photo-941195.jpeg?_gl=1*16s9abj*_ga*MTUyNjQ1Ni4xNzYxMjk3Njg2*_ga_8JE65Q40S6*czE3NjEyOTc2ODYkbzEkZzEkdDE3NjEyOTc2OTEkajU1JGwwJGgw",
  },
  {
    id: "3",
    href: "#",
    name: "Đà Nẵng",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://images.pexels.com/photos/34373621/pexels-photo-34373621.jpeg?_gl=1*t4ikk5*_ga*MTUyNjQ1Ni4xNzYxMjk3Njg2*_ga_8JE65Q40S6*czE3NjEyOTc2ODYkbzEkZzEkdDE3NjEyOTc3NjgkajM5JGwwJGgw",
  },
  {
    id: "4",
    href: "#",
    name: "Quy Nhơn",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://images.pexels.com/photos/30228245/pexels-photo-30228245.jpeg?_gl=1*jgiqxw*_ga*MTUyNjQ1Ni4xNzYxMjk3Njg2*_ga_8JE65Q40S6*czE3NjEyOTc2ODYkbzEkZzEkdDE3NjEyOTc4MTYkajUyJGwwJGgw"
  },
  {
    id: "5",
    href: "#",
    name: "Tokyo",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://images.pexels.com/photos/4151484/pexels-photo-4151484.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
  },
  {
    id: "6",
    href: "#",
    name: "Maldives",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://images.pexels.com/photos/3250613/pexels-photo-3250613.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "7",
    href: "#",
    name: "Italy",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://images.pexels.com/photos/7740160/pexels-photo-7740160.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
];

const DEMO_CATS_2: TaxonomyType[] = [
  {
    id: "1",
    href: "#",
    name: "Mộc Châu",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/3-1631943692874.jpg",
  },
  {
    id: "2",
    href: "#",
    name: "Hà Nội",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/12-1632469376242.jpg",
  },
  {
    id: "3",
    href: "#",
    name: "Gia Lai",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/thumbnailgialai-1621660892075.jpg",
  },
  {
    id: "4",
    href: "#",
    name: "Sapa",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/1-1631977118185.jpg",
  },
  {
    id: "5",
    href: "#",
    name: "Quảng Bình",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/thumbnailqb-1621669116556.jpg",
  },
  {
    id: "6",
    href: "#",
    name: "Tây Bắc",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/4-1631961227979.jpg",
  },
  {
    id: "7",
    href: "#",
    name: "Phú Quốc",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/thumbnailpq-1621670820001.jpg"
  },
];

function PageHome() {


  const [message, setMessage] = useState("");
  const router = useRouter();
  const masterStore = useAppSelector((state) => state.master);

  // useEffect(() => {
  

  //   if (!access_token) {
  //     router.push("/login"); // nếu chưa login thì quay lại trang login
  //     return;
  //   }
  //   axios
  //     .get("/", {
  //       headers: { Authorization: `Bearer ${access_token}` },
  //     })
  //     .then((res) => setMessage(res.data.message))
  //     .catch(() => router.push("/login"));
  // }, [router]);

  useEffect(() => {
    if(masterStore.isAdmin){
      router.push("/dashboard");
    }
  },[masterStore.isAdmin])
    

  return (
    <main className="nc-PageHome relative overflow-hidden">
      {/* GLASSMOPHIN */}
      <BgGlassmorphism />

      {/* SEARCH MODAL - Hiển thị khi scroll */}
      <SearchModal />

      {/* HERO SECTION WITH CAROUSEL BACKGROUND */}
      <SectionHeroWithCarousel className="mb-16 lg:mb-24" />

      <div className="container relative space-y-24 mb-24 lg:space-y-28 lg:mb-28">

        {/* SECTION 1 */}
        <SectionSliderNewCategories categories={DEMO_CATS} />

        {/* <SectionOurFeatures /> */}

        <div className="relative py-16">
          <BackgroundSection className="bg-orange-50 dark:bg-black/20" />
          <SectionSliderNewCategories
            categories={DEMO_CATS_2}
            categoryCardType="card4"
            itemPerRow={4}
            heading="Gợi ý cho bạn"
            subHeading="Những điểm đến được đề xuất cho bạn"
            sliderStyle="style2"
          />
        </div>

        {/* <SectionSubscribe2 /> */}

        {/* <div className="relative py-16">
          <BackgroundSection className="bg-orange-50 dark:bg-black dark:bg-opacity-20 " />
        </div> */}

        <SectionGridCategoryBox />

        {/* SECTION - TRA CỨU VÉ MÁY BAY */}
        <SectionBookingLookup />

        {/* <div className="relative py-16">
          <BackgroundSection />
          <SectionBecomeAnAuthor />
        </div> */}

        {/* <SectionSliderNewCategories
          heading="Explore by types of stays"
          subHeading="Explore houses based on 10 types of stays"
          categoryCardType="card5"
          itemPerRow={5}
        /> */}

        <SectionVideos />

        {/* <div className="relative py-16">
          <BackgroundSection />
          <SectionClientSay />
        </div> */}
      </div>
      <p>{message}</p>
    </main>
  );
}

export default PageHome;
