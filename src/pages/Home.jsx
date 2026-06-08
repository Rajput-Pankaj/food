import PageLayout from '../components/PageLayout';
import HeroSlider from '../components/home/HeroSlider';
import AppPromoStrip from '../components/home/AppPromoStrip';
import OffersSection from '../components/home/OffersSection';
import StatsBar from '../components/home/StatsBar';
import CategoryShowcase from '../components/home/CategoryShowcase';
import FeaturedDishes from '../components/home/FeaturedDishes';
import HowItWorks from '../components/home/HowItWorks';
import TestimonialsSection from '../components/home/TestimonialsSection';
import HomeCta from '../components/home/HomeCta';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function Home() {
  useDocumentTitle('Home — Delicious Food Delivered');

  return (
    <PageLayout showSearch>
      <HeroSlider />
      <AppPromoStrip />
      <OffersSection />
      <StatsBar />
      <CategoryShowcase />
      <FeaturedDishes />
      <HowItWorks />
      <TestimonialsSection />
      <HomeCta />
    </PageLayout>
  );
}

export default Home;
