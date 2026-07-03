import { Award } from "lucide-react";
import trainerImage from "@/assets/trainer-1.jpg";
import battleRopes from "@/assets/battle-ropes.jpg";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useParallax } from "@/hooks/use-parallax";

const Trainers = () => {
  const { elementRef: headerRef, isVisible: headerVisible } = useIntersectionObserver();
  const { elementRef: cardsRef, isVisible: cardsVisible } = useIntersectionObserver();
  const { elementRef: parallaxRef, offset: parallaxOffset } = useParallax({ speed: 0.4 });
  const trainers = [
    {
      name: "Mr. Kalyan",
      image: trainerImage,
      title: "Head Coach & Owner",
      certifications: ["IFSA Certified", "Mr. Maharashtra Runner-up"],
      specialization: "Bodybuilding & Strength Training",
      experience: "15+ Years"
    },
    {
      name: "Certified Trainer",
      image: trainerImage,
      title: "Personal Trainer",
      certifications: ["Certified Fitness Trainer"],
      specialization: "Weight Loss & Cardio",
      experience: "5+ Years"
    },
    {
      name: "Certified Trainer",
      image: trainerImage,
      title: "CrossFit Specialist",
      certifications: ["CrossFit Level 1"],
      specialization: "Functional Training",
      experience: "5+ Years"
    }
  ];

  return (
    <section id="trainers" className="py-24 bg-background relative overflow-hidden scroll-mt-20">
      {/* Floating Equipment Background */}
      <div ref={parallaxRef} className="hidden lg:block absolute bottom-10 left-0 w-1/4 h-48 opacity-5 pointer-events-none">
        <img 
          src={battleRopes.src} 
          alt="" 
          className="w-full h-full object-cover rounded-r-3xl"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div ref={headerRef} className={`text-center mb-16 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">Our Team</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
            Meet Your <span className="gradient-text">Expert Trainers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our certified trainers have over 5 years of experience and have trained athletes who've competed nationally. 
            Including <span className="text-primary font-bold">Mr. Yash Pal - 2nd Rank at ICN India</span>.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer, index) => (
            <div 
              key={index} 
              className={`group bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-2xl overflow-hidden hover:border-primary transition-all hover-glow hover:-translate-y-2 cursor-pointer ${
                cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: `${index * 150}ms`,
                transitionDuration: '700ms'
              }}
            >
              {/* Image */}
              <div className="relative overflow-hidden aspect-square">
                <img 
                  src={trainer.image.src} 
                  alt={trainer.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60"></div>
                
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-primary text-background px-3 py-1 rounded-full text-xs font-bold animate-glow-pulse">
                  {trainer.experience}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black mb-1 group-hover:text-primary transition-colors">{trainer.name}</h3>
                  <p className="text-primary font-semibold text-sm">{trainer.title}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Specialization:</p>
                  <p className="font-semibold">{trainer.specialization}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {trainer.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center space-x-1 bg-secondary px-3 py-1 rounded-full group-hover:bg-primary group-hover:text-background transition-all">
                      <Award className="w-3 h-3" />
                      <span className="text-xs font-semibold">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Trainers;
