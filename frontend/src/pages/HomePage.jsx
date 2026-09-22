import { useState, useEffect } from 'react';
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
import { fetchHomepageMedia, HOMEPAGE_SECTIONS } from '../services/homepageMediaService';

export default function HomePage({ wishlist, toggleWishlist, onSuratClick, onBestSellingClick, onItemClick, onProductClick }) {
  const [homepageMedia, setHomepageMedia] = useState([]);

  useEffect(() => {
    fetchHomepageMedia()
      .then(items => setHomepageMedia(Array.isArray(items) ? items : []))
      .catch(() => setHomepageMedia([]));
  }, []);

  const bySection = (section) =>
    homepageMedia
      .filter(i => i.section === section)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id);

  // Hard caps mirror the admin slot limits so the homepage never renders more
  // than the intended number of slides/videos even if extra rows exist.
  const sliderImages = bySection(HOMEPAGE_SECTIONS.SLIDER).slice(0, 5);
  const cityImage = bySection(HOMEPAGE_SECTIONS.CITY_DELIVERY)[0] || null;
  const advertiseImage = bySection(HOMEPAGE_SECTIONS.ADVERTISE)[0] || null;
  const spotlightVideos = bySection(HOMEPAGE_SECTIONS.SPOTLIGHT).slice(0, 8);

  return (
    <>
      <HeroSlider images={sliderImages} />
      <HeroTagline />
      <CityDelivery onCityClick={onSuratClick} image={cityImage} />
      <BestSelling wishlist={wishlist} toggleWishlist={toggleWishlist} onViewAll={() => onBestSellingClick('Best Selling Flowers & Gifts')} onProductClick={onProductClick} />
      <BestSellingArtificial wishlist={wishlist} toggleWishlist={toggleWishlist} onViewAll={() => onBestSellingClick('Best Selling Artificial Items')} onProductClick={onProductClick} />
      <PromoBanner image={advertiseImage} />
      <ShopByOccasion onItemClick={onItemClick} />
      <ShopByRecipient onItemClick={onItemClick} />
      <InTheSpotlight videos={spotlightVideos} />
      <ClientReviews />
    </>
  );
}
