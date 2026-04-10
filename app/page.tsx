import { Hero } from "@/components/home/Hero";
import { MarqueeBanner } from "@/components/home/MarqueeBanner";
import { Collection } from "@/components/home/Collection";
import { SceneGallery } from "@/components/home/SceneGallery";
import { HowToUse } from "@/components/home/HowToUse";
import { BrandStory } from "@/components/home/BrandStory";
import { InstagramFeed } from "@/components/home/InstagramFeed";
import { XReviews } from "@/components/home/XReviews";
import { WhereToBuy } from "@/components/home/WhereToBuy";

export default function Home() {
  return (
    <>
      <Hero />
      <MarqueeBanner />
      <Collection />
      <SceneGallery />
      <HowToUse />
      <BrandStory />
      <InstagramFeed />
      <XReviews />
      <WhereToBuy />
    </>
  );
}
