import { Dumbbell, Activity, User, TrendingDown, TrendingUp, Heart, Droplets, UtensilsCrossed, Lock, Package, Users } from "lucide-react";
import equipmentImage from "@/assets/equipment.jpg";
import dumbbells from "@/assets/dumbbells.jpg";
import battleRopes from "@/assets/battle-ropes.jpg";
import tyres from "@/assets/tyres.jpg";
import gymMachines from "@/assets/gym-machines.jpg";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useParallax } from "@/hooks/use-parallax";

const Services = () => {
  const { elementRef: headerRef, isVisible: headerVisible } = useIntersectionObserver();
  const { elementRef: cardsRef, isVisible: cardsVisible } = useIntersectionObserver();
  const { elementRef: parallaxRef, offset: parallaxOffset } = useParallax({ speed: 0.5 });
  const mainServices = [
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: "Strength Training",
      description: "Build muscle and power with Being Strong machines and expert guidance",
      image: dumbbells
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "CrossFit",
      description: "High-intensity functional training for total body transformation",
      image: battleRopes
    },
    {
      icon: <User className="w-8 h-8" />,
      title: "Personal Training",
      description: "One-on-one customized training with certified professionals",
      image: gymMachines
    },
    {
      icon: <TrendingDown className="w-8 h-8" />,
      title: "Weight Loss",
      description: "Personalized programs to help you achieve your ideal weight",
      image: tyres
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Muscle Gain",
      description: "Scientifically designed programs for maximum muscle growth",
      image: dumbbells
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Cardio",
      description: "Improve cardiovascular health and endurance",
      image: battleRopes
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "BEING STRONG Equipments",
      description: "2 set of machine in every equipment",
      image: equipmentImage
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Co-operative Staff",
      description: "Friendly and helpful staff ready to assist you with your fitness journey",
      image: gymMachines
    }
  ];

  const additionalFacilities = [
    { icon: <Droplets className="w-5 h-5" />, text: "Free Water" },
    { icon: <UtensilsCrossed className="w-5 h-5" />, text: "Personalized Diet Plans" },
    { icon: <Lock className="w-5 h-5" />, text: "Secure Locker Rooms" }
  ];

  return (
    <section id="services" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div ref={parallaxRef} className="absolute inset-0 opacity-5">
        <img 
          src={equipmentImage.src} 
          alt="" 
          className="w-full h-full object-cover"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div ref={headerRef} className={`text-center mb-16 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">What We Offer</p>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From strength training to personalized nutrition plans, we provide everything you need to transform your fitness journey.
          </p>
        </div>

        {/* Main Services Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mainServices.map((service, index) => (
            <div 
              key={index}
              className={`relative bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl overflow-hidden hover:border-primary transition-all hover-glow group hover:-translate-y-2 cursor-pointer ${
                cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: `${index * 100}ms`,
                transitionDuration: '700ms'
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                <img 
                  src={service.image.src} 
                  alt="" 
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                />
              </div>
              
              <div className="relative p-8">
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-black mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            </div>
          ))}
        </div>

          {/* Additional Facilities */}
          <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-primary/30 rounded-2xl p-8 animate-fade-in hover:shadow-2xl transition-shadow">
            <h3 className="text-2xl font-black mb-6 text-center">Additional Facilities</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {additionalFacilities.map((facility, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3 bg-secondary px-6 py-3 rounded-full hover:bg-primary hover:text-background transition-all cursor-pointer hover:scale-105"
                >
                  <div className="text-current">{facility.icon}</div>
                  <span className="font-semibold">{facility.text}</span>
                </div>
              ))}
            </div>
          </div>
      </div>
    </section>
  );
};

export default Services;
