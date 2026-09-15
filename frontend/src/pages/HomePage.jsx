import HeroSlider from '../components/HeroSlider';
import HeroTagline from '../components/HeroTagline';
import CityDelivery from '../components/CityDelivery';
import BestSelling from '../components/BestSelling';
import BestSellingArtificial from '../components/BestSellingArtificial';
import PromoBanner from '../components/PromoBanner';
import ShopByOccasion from '../components/ShopByOccasion';
import ShopByRecipient from '../components/ShopByRecipient';
import InTheSpotlight from '../components/InTheSpotlight';
import ClientReviews from '../components/ClientReviews';

export default function HomePage({ wishlist, toggleWishlist, onSuratClick, onBestSellingClick, onItemClick, onProductClick }) {
  return (
    <>
      <HeroSlider />
      <HeroTagline />
      <CityDelivery onCityClick={onSuratClick} />
      <BestSelling wishlist={wishlist} toggleWishlist={toggleWishlist} onViewAll={() => onBestSellingClick('Best Selling Flowers & Gifts')} onProductClick={onProductClick} />
      <BestSellingArtificial wishlist={wishlist} toggleWishlist={toggleWishlist} onViewAll={() => onBestSellingClick('Best Selling Artificial Items')} onProductClick={onProductClick} />
      <PromoBanner />
      <ShopByOccasion onItemClick={onItemClick} />
      <ShopByRecipient onItemClick={onItemClick} />
      <InTheSpotlight />
      <ClientReviews />
    </>
  );
}
