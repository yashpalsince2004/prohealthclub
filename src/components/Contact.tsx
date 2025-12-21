import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

const Contact = () => {
  const { toast } = useToast();
  const { elementRef: headerRef, isVisible: headerVisible } = useIntersectionObserver();
  const { elementRef: contentRef, isVisible: contentVisible } = useIntersectionObserver();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you soon.",
    });
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      value: "+91 9867016344",
      link: "tel:+919867016344"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      value: "prohealthclubkalyan@gmail.com",
      link: "mailto:prohealthclubkalyan@gmail.com"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location",
      value: "Janta Bank, Malangad Rd, behind Kalyan, Gopal Krishna Nagar, Kalyan East, Maharashtra 421306",
      link: "https://maps.google.com/?q=Gopal+Krishna+Nagar+Kalyan+East"
    },
    {
      icon: <Instagram className="w-6 h-6" />,
      title: "Instagram",
      value: "@prrohealthcllub",
      link: "https://www.instagram.com/prrohealthcllub"
    }
  ];

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div ref={headerRef} className={`text-center mb-16 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">Get In Touch</p>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Start Your <span className="gradient-text">Transformation</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Ready to take the first step? Contact us today for a free consultation or visit our gym in Kalyan.
          </p>
        </div>

        <div ref={contentRef} className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className={`space-y-6 transition-all duration-700 ${contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            {contactInfo.map((info, index) => (
                <a
                key={index}
                href={info.link}
                target={info.link.startsWith("http") ? "_blank" : undefined}
                rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-start space-x-4 p-6 bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl hover:border-primary transition-all hover-glow hover:-translate-y-1 group"
              >
                <div className="text-primary group-hover:scale-110 transition-transform mt-1">
                  {info.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-muted-foreground mb-1 group-hover:text-primary transition-colors">{info.title}</h3>
                  <p className="font-semibold text-foreground">{info.value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div className={`transition-all duration-700 delay-200 ${contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2">Your Name</label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  required 
                  className="bg-background border-border focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">Email Address</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  className="bg-background border-border focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold mb-2">Phone Number</label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+91 98670 16344" 
                  required 
                  className="bg-background border-border focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2">Message</label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us about your fitness goals..." 
                  rows={4}
                  required 
                  className="bg-background border-border resize-none focus:border-primary transition-colors"
                />
              </div>

              <Button type="submit" variant="default" size="lg" className="w-full hover-glow font-bold animate-glow-pulse">
                Send Message
              </Button>
            </form>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="mt-16 animate-fade-in">
          <div className="rounded-2xl overflow-hidden border border-border shadow-2xl h-96">
            <iframe
              src="https://maps.google.com/maps?q=Pro+Health+Club+Kalyan+East+Maharashtra+421306&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Prro Health Cllub Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
