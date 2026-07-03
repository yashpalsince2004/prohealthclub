import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";
import dumbbells from "@/assets/dumbbells.jpg";
import tyres from "@/assets/tyres.jpg";
import { useParallax } from "@/hooks/use-parallax";

const Hero = () => {
  const { elementRef: bgRef, offset: bgOffset } = useParallax({ speed: 0.3 });
  const { elementRef: floatRef1, offset: floatOffset1 } = useParallax({ speed: 0.6 });
  const { elementRef: floatRef2, offset: floatOffset2 } = useParallax({ speed: 0.4 });
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <img 
          src={heroImage.src} 
          alt="Prro Health Cllub gym interior" 
          className="w-full h-full object-cover opacity-50"
          style={{ transform: `translateY(${bgOffset}px)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/70"></div>
      </div>

      {/* Floating Equipment Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div ref={floatRef1}>
          <img 
            src={dumbbells.src} 
            alt="" 
            className="absolute top-20 left-2 md:left-10 w-32 md:w-48 h-24 md:h-32 object-cover opacity-10 animate-float rounded-lg"
            style={{ 
              animationDelay: '0s',
              transform: `translateY(${floatOffset1}px)`
            }}
          />
        </div>
        <div ref={floatRef2}>
          <img 
            src={tyres.src} 
            alt="" 
            className="absolute bottom-32 right-2 md:right-10 w-40 md:w-56 h-32 md:h-40 object-cover opacity-10 animate-float rounded-lg"
            style={{ 
              animationDelay: '1s',
              transform: `translateY(${floatOffset2}px)`
            }}
          />
        </div>
        <img 
          src={dumbbells.src} 
          alt="" 
          className="hidden md:block absolute top-1/2 right-20 w-40 h-28 object-cover opacity-5 animate-float rounded-lg"
          style={{ 
            animationDelay: '2s',
            transform: `translateY(${floatOffset1 * 0.7}px)`
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 z-10 text-center">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          {/* Tagline */}
          <p className="text-sm md:text-base font-semibold tracking-widest text-primary uppercase">
            Train with the Best. Become the Best.
          </p>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
            Time to{" "}
            <span className="gradient-text text-glow">Push</span>
            <br />
            Your Limits
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Prro Health Cllub is the best-equipped gym in Kalyan, powered by Being Strong machines. 
            With certified trainers and 15+ years of experience, we help you achieve your fitness goals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="#about">
              <Button 
                variant="cta" 
                size="lg" 
                className="hover-glow font-bold text-base px-8 py-6 animate-glow-pulse group"
              >
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </a>
            <a href="#about">
              <Button 
                variant="outline" 
                size="lg" 
                className="font-bold text-base px-8 py-6 border-2 hover:bg-secondary"
              >
                <ChevronDown className="mr-2" size={20} />
                Explore More
              </Button>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-8 max-w-3xl mx-auto pt-12">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-5xl font-black gradient-text">15+</div>
              <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-5xl font-black gradient-text">220+</div>
              <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">Happy Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-5xl font-black gradient-text">5+</div>
              <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">National Athletes</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
