import { Award, Heart, Target, Zap } from "lucide-react";
import ownerImage from "@/assets/owner-kalyan.jpg";
import gymMachines from "@/assets/gym-machines.jpg";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useParallax } from "@/hooks/use-parallax";

const About = () => {
  const { elementRef: sectionRef, isVisible: sectionVisible } = useIntersectionObserver();
  const { elementRef: parallaxRef, offset: parallaxOffset } = useParallax({ speed: 0.4 });
  const highlights = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Best Equipment",
      description: "Powered by Being Strong machines with daily maintenance"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Certified Trainers",
      description: "5+ years of professional training experience"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Clean & Hygienic",
      description: "Daily cleaning and top-notch hygiene standards"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Results Driven",
      description: "Proven track record with national athletes"
    }
  ];

  return (
    <section ref={sectionRef} id="about" className="py-24 bg-secondary/30 relative overflow-hidden scroll-mt-20">
      {/* Floating Equipment Background */}
      <div ref={parallaxRef} className="hidden lg:block absolute top-20 right-0 w-1/3 h-64 opacity-5 pointer-events-none">
        <img 
          src={gymMachines} 
          alt="" 
          className="w-full h-full object-cover rounded-l-3xl"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Section */}
          <div className={`relative transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="relative z-10 group">
              <img 
                src={ownerImage} 
                alt="Mr. Kalyan - Owner of Prro Health Cllub" 
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-background p-6 rounded-xl shadow-xl animate-glow-pulse">
                <div className="text-3xl font-black">15+</div>
                <div className="text-sm font-semibold">Years Excellence</div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className={`space-y-8 transition-all duration-700 delay-200 ${sectionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div>
              <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">About Us</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
                Welcome to <span className="gradient-text">Prro Health Cllub</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Prro Health Cllub is the best-equipped gym in the area, powered by Being Strong machines 
                and maintained with daily cleaning and top-notch hygiene standards. With certified trainers 
                boasting over 5 years of experience, we offer a friendly yet disciplined environment to help 
                every member achieve their fitness goals.
              </p>
            </div>

            {/* Owner Info */}
            <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl p-6 hover:border-primary transition-all hover:shadow-xl group">
              <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors">Meet Mr. Kalyan</h3>
              <p className="text-muted-foreground mb-4">
                <span className="text-primary font-bold">Runner-up in Mr. Maharashtra</span> | IFSA Certified
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With 15+ years of experience in professional training and gym management, Mr. Kalyan 
                brings championship-level expertise to every member. His vision: creating a space where 
                discipline meets results.
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {highlights.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 p-4 rounded-lg bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-primary transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
                >
                  <div className="text-primary mt-1 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                  <div>
                    <h4 className="font-bold mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
