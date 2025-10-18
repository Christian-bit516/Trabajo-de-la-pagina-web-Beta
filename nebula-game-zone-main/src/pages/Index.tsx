import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedGames from "@/components/FeaturedGames";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedGames />
      </main>
    </div>
  );
};

export default Index;
