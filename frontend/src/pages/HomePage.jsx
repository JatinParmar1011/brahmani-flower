import HeroSlider from '../components/HeroSlider';
import HeroTagline from '../components/HeroTagline';
import BestSelling from '../components/BestSelling';
import PromoBanner from '../components/PromoBanner';
import ShopByOccasion from '../components/ShopByOccasion';
import ShopByRecipient from '../components/ShopByRecipient';
import InTheSpotlight from '../components/InTheSpotlight';
import ClientReviews from '../components/ClientReviews';

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <HeroTagline />
      <BestSelling />
      <PromoBanner />
      <ShopByOccasion />
      <ShopByRecipient />
      <InTheSpotlight />
      <ClientReviews />
    </>
  );
}
