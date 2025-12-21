import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Trainers from "@/components/Trainers";
import Transformations from "@/components/Transformations";
import Services from "@/components/Services";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingActionButton from "@/components/FloatingActionButton";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Trainers />
        <Transformations />
        <Services />
        <Pricing />
        <Contact />
      </main>
      <Footer />
      <FloatingActionButton />
    </div>
  );
};

export default Index;
