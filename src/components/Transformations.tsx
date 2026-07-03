import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import BMICalculator from "./BMICalculator";
import BodyFatCalculator from "./BodyFatCalculator";
import BeforeAfterSlider from "./BeforeAfterSlider";

const Transformations = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { elementRef: heroRef, isVisible: heroVisible } = useIntersectionObserver();
  const { elementRef: carouselRef, isVisible: carouselVisible } = useIntersectionObserver();
  const { elementRef: sliderRef, isVisible: sliderVisible } = useIntersectionObserver();
  const { elementRef: testimonialsRef, isVisible: testimonialsVisible } = useIntersectionObserver();

  const transformations = [
    {
      name: "Ravi Kumar",
      duration: "3-Month Transformation",
      beforeWeight: "87 KG",
      afterWeight: "78 KG",
      beforeImage: "/prohealthclub/placeholder.svg",
      afterImage: "/prohealthclub/placeholder.svg"
    },
    {
      name: "Priya Sharma",
      duration: "6-Month Transformation",
      beforeWeight: "75 KG",
      afterWeight: "65 KG",
      beforeImage: "/prohealthclub/placeholder.svg",
      afterImage: "/prohealthclub/placeholder.svg"
    },
    {
      name: "Amit Patel",
      duration: "4-Month Transformation",
      beforeWeight: "92 KG",
      afterWeight: "82 KG",
      beforeImage: "/prohealthclub/placeholder.svg",
      afterImage: "/prohealthclub/placeholder.svg"
    },
    {
      name: "Sneha Reddy",
      duration: "5-Month Transformation",
      beforeWeight: "68 KG",
      afterWeight: "60 KG",
      beforeImage: "/prohealthclub/placeholder.svg",
      afterImage: "/prohealthclub/placeholder.svg"
    },
    {
      name: "Rajesh Singh",
      duration: "3-Month Transformation",
      beforeWeight: "95 KG",
      afterWeight: "85 KG",
      beforeImage: "/prohealthclub/placeholder.svg",
      afterImage: "/prohealthclub/placeholder.svg"
    }
  ];

  const testimonials = [
    {
      text: "Thanks to remote personal training, I experienced a significant transformation both physically and mentally in a short period of time. The support from my trainer allowed me to reach my fitness goals, and I continue to see progress. I now feel stronger and more confident!",
      author: "Omar A.",
      avatar: "/prohealthclub/placeholder.svg"
    },
    {
      text: "The personalized training program helped me lose 15kg in just 4 months. I never thought I could achieve such amazing results. The dedication and expertise of my trainer made all the difference!",
      author: "Sarah M.",
      avatar: "/prohealthclub/placeholder.svg"
    },
    {
      text: "From struggling with basic exercises to completing advanced workouts, my journey has been incredible. The constant motivation and customized meal plans were game-changers for me!",
      author: "Vikram T.",
      avatar: "/prohealthclub/placeholder.svg"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % transformations.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + transformations.length) % transformations.length);
  };

  const visibleCards = 3;
  const displayedTransformations = [
    ...transformations.slice(currentIndex, currentIndex + visibleCards),
    ...transformations.slice(0, Math.max(0, currentIndex + visibleCards - transformations.length))
  ];

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} id="transformations" className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className={`container mx-auto px-4 text-center transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Witness the <span className="text-primary">Transformations</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The changes are not just skin-deep through what achieves real personal goals that work and a powerful influence of their physique & mental health.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <BMICalculator />
            <BodyFatCalculator />
          </div>
        </div>
      </section>

      {/* Transformations Carousel */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div ref={carouselRef} className={`text-center mb-12 transition-all duration-700 ${carouselVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Real Results, Real People
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See the incredible transformations of our students who pushed their limits and achieved their fitness goals.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transition-all duration-700 ${carouselVisible ? 'opacity-100' : 'opacity-0'}`}>
              {displayedTransformations.slice(0, visibleCards).map((transformation, index) => (
                <Card 
                  key={`${transformation.name}-${index}`}
                  className="group relative overflow-hidden bg-[var(--glass-bg)] backdrop-blur-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-[var(--glass-border)]"
                >
                  <BeforeAfterSlider
                    beforeImage={transformation.beforeImage}
                    afterImage={transformation.afterImage}
                    beforeLabel={transformation.beforeWeight}
                    afterLabel={transformation.afterWeight}
                  />
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">{transformation.name}</h3>
                    <p className="text-sm text-muted-foreground">{transformation.duration}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div ref={testimonialsRef} className={`text-center mb-12 transition-all duration-700 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Real Results, <span className="text-primary">Real Stories</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every individual at R Fitness, but our common ground is transformation. Explore the super-power of our success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className={`p-8 bg-[var(--glass-bg)] backdrop-blur-md hover:shadow-xl transition-all hover:-translate-y-1 border-[var(--glass-border)] ${
                  testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  transitionDuration: '700ms'
                }}
              >
                <div className="mb-6">
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-primary">{testimonial.author}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Transformations;
