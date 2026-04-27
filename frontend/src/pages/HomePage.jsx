import HeroSlider from '../components/HeroSlider';
import HeroTagline from '../components/HeroTagline';
import BestSelling from '../components/BestSelling';
import BestSellingArtificial from '../components/BestSellingArtificial';
import PromoBanner from '../components/PromoBanner';
import ShopByOccasion from '../components/ShopByOccasion';
import ShopByRecipient from '../components/ShopByRecipient';
import InTheSpotlight from '../components/InTheSpotlight';
import ClientReviews from '../components/ClientReviews';

export default function HomePage({ wishlist, toggleWishlist }) {
  return (
    <>
      <HeroSlider />
      <HeroTagline />
      <BestSelling wishlist={wishlist} toggleWishlist={toggleWishlist} />
      <BestSellingArtificial wishlist={wishlist} toggleWishlist={toggleWishlist} />
      <PromoBanner />
      <ShopByOccasion />
      <ShopByRecipient />
      <InTheSpotlight />
      <ClientReviews />
    </>
  );
}
