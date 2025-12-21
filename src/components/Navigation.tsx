import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "#home", isHash: true },
    { label: "About", href: "#about", isHash: true },
    { label: "Trainers", href: "#trainers", isHash: true },
    { label: "Transformations", href: "#transformations", isHash: true },
    { label: "Services", href: "#services", isHash: true },
    { label: "Contact", href: "#contact", isHash: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center space-x-3">
            <img 
              src={logo} 
              alt="Prro Health Cllub Logo" 
              className="h-14 w-14 object-contain"
            />
            <div className="text-xl font-black gradient-text">Prro Health Cllub</div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              item.isHash ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button variant="cta" size="lg" className="hover-glow font-bold">
              Join Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden pb-6 animate-fade-in">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                item.isHash ? (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-base font-semibold text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-base font-semibold text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              ))}
              <Button variant="cta" size="lg" className="hover-glow font-bold">
                Join Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
