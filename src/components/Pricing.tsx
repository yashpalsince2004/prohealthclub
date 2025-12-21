import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

const Pricing = () => {
  const { elementRef: headerRef, isVisible: headerVisible } = useIntersectionObserver();
  const { elementRef: cardsRef, isVisible: cardsVisible } = useIntersectionObserver();
  const packages = [
    {
      name: "Starter Pack",
      price: "1,000",
      originalPrice: "1,500",
      duration: "1 Month",
      description: "Perfect for beginners to start their fitness journey",
      features: [
        "Full gym access",
        "Basic workout plan",
        "1 free diet consultation",
        "Locker facility",
        "Unlimited visit",
      ],
      highlighted: false,
    },
    {
      name: "3-Month Pack",
      price: "3,000",
      originalPrice: "4,500",
      duration: "3 Months",
      description: "Most popular choice for consistent progress and results",
      features: [
        "Full gym access",
        "Customized workout plan",
        "3 months diet plan",
        "Progress tracking",
        "Locker facility",
        "Unlimited visit",
      ],
      highlighted: false,
    },
    {
      name: "Annually Pack",
      price: "9,000",
      originalPrice: "18,000",
      duration: "12 Months",
      description: "Best value for serious fitness enthusiasts and transformation",
      features: [
        "Full gym access",
        "Personal training sessions",
        "Complete diet plan",
        "Progress tracking",
        "Priority support",
        "Locker facility",
        "Unlimited visit",
        "Free supplements guide",
      ],
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-16 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Personal Training <span className="gradient-text">Packages</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            With diverse packages tailored to your needs and goals, let's choose the best plan for you on your healthy living journey.
          </p>
        </div>

        {/* Pricing Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 backdrop-blur-md transition-all hover:scale-105 ${
                pkg.highlighted
                  ? "bg-primary text-primary-foreground shadow-[0_0_60px_rgba(255,87,34,0.4)] animate-glow-pulse"
                  : "bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-primary/50"
              } ${
                cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${index * 150}ms`,
                transitionDuration: '700ms'
              }}
            >
              {pkg.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary px-6 py-2 rounded-full">
                  <span className="text-sm font-bold text-primary">MOST POPULAR</span>
                </div>
              )}

              {/* Package Header */}
              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${pkg.highlighted ? "" : "text-foreground"}`}>
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold">₹{pkg.price}</span>
                  <span className={`text-lg line-through ${pkg.highlighted ? "opacity-70" : "text-muted-foreground"}`}>
                    ₹{pkg.originalPrice}
                  </span>
                </div>
                <p className={`text-sm ${pkg.highlighted ? "opacity-90" : "text-muted-foreground"}`}>
                  {pkg.description}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full mb-6 ${
                  pkg.highlighted
                    ? "bg-background text-primary hover:bg-background/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                size="lg"
              >
                Get started
              </Button>

              {/* Features List */}
              <ul className="space-y-4">
                {pkg.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        pkg.highlighted ? "text-background" : "text-primary"
                      }`}
                    />
                    <span className={`text-sm ${pkg.highlighted ? "" : "text-foreground"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12 animate-fade-in">
          <p className="text-muted-foreground">
            All packages include access to our premium equipment and facilities. 
            <span className="text-primary font-semibold"> Contact us</span> for custom plans.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
