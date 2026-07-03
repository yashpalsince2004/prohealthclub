import { Instagram, Phone, Mail } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/30 border-t border-border py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={logo.src} 
                alt="Prro Health Cllub Logo" 
                className="h-12 w-12 object-contain"
              />
              <h3 className="text-2xl font-black gradient-text">Prro Health Cllub</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Train with the Best. Become the Best.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "About", "Trainers", "Services", "Contact"].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Connect With Us</h4>
            <div className="space-y-3">
              <a href="tel:+919867016344" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                <span>+91 9867016344</span>
              </a>
              <a href="mailto:prohealthclubkalyan@gmail.com" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                <span>prohealthclubkalyan@gmail.com</span>
              </a>
              <a 
                href="https://www.instagram.com/prrohealthcllub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>@prrohealthcllub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {currentYear} Prro Health Cllub. All rights reserved. | Designed with 💪 for fitness excellence.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
