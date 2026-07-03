import { $ as $$Layout } from './Layout_DJ57xND-.mjs';
import { c as createComponent } from './astro-component_DFzFZJkT.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead } from './sequence_C_6OXDIK.mjs';
import { r as renderComponent } from './entrypoint_DzPIJZEz.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Menu, ArrowRight, ChevronDown, Zap, Award, Heart, Target, Calculator, Scale, Activity, Dumbbell, ChevronUp, Check, Percent, TrendingDown, ChevronLeft, ChevronRight, User, TrendingUp, Package, Users, Droplets, UtensilsCrossed, Lock, Phone, Mail, MapPin, Instagram, Bot, Send, MessageCircle } from 'lucide-react';
import { l as logo, B as Button, h as heroImage, c as cn, L as Label, I as Input } from './logo_bEuTxbUc.mjs';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { useTheme } from 'next-themes';
import { Toaster as Toaster$2 } from 'sonner';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Trainers", href: "#trainers" },
    { label: "Transformations", href: "#transformations" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" }
  ];
  return /* @__PURE__ */ jsx("nav", { className: "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-20", children: [
      /* @__PURE__ */ jsxs("a", { href: "#home", className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: logo.src,
            alt: "Prro Health Cllub Logo",
            className: "h-14 w-14 object-contain"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-black gradient-text", children: "Prro Health Cllub" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "hidden lg:flex items-center space-x-1", children: navItems.map((item) => /* @__PURE__ */ jsx(
        "a",
        {
          href: item.href,
          className: "px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors",
          children: item.label
        },
        item.label
      )) }),
      /* @__PURE__ */ jsx("div", { className: "hidden lg:flex items-center space-x-3", children: /* @__PURE__ */ jsx("a", { href: "/login/", children: /* @__PURE__ */ jsx(Button, { variant: "cta", size: "lg", className: "hover-glow font-bold", children: "Join Now" }) }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsOpen(!isOpen),
          className: "lg:hidden text-foreground",
          "aria-label": "Toggle menu",
          children: isOpen ? /* @__PURE__ */ jsx(X, { size: 28 }) : /* @__PURE__ */ jsx(Menu, { size: 28 })
        }
      )
    ] }),
    isOpen && /* @__PURE__ */ jsx("div", { className: "lg:hidden pb-6 animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-3", children: [
      navItems.map((item) => /* @__PURE__ */ jsx(
        "a",
        {
          href: item.href,
          onClick: () => setIsOpen(false),
          className: "px-4 py-3 text-base font-semibold text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors",
          children: item.label
        },
        item.label
      )),
      /* @__PURE__ */ jsx("a", { href: "/login/", onClick: () => setIsOpen(false), className: "w-full", children: /* @__PURE__ */ jsx(Button, { variant: "cta", size: "lg", className: "w-full hover-glow font-bold", children: "Join Now" }) })
    ] }) })
  ] }) });
};

const dumbbells = new Proxy({"src":"/_astro/dumbbells.DKvFOWqB.jpg","width":1280,"height":720,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/assets/dumbbells.jpg";
							}
							
							return target[name];
						}
					});

const tyres = new Proxy({"src":"/_astro/tyres.Dr3XaP9i.jpg","width":1280,"height":720,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/assets/tyres.jpg";
							}
							
							return target[name];
						}
					});

const useParallax = (options = {}) => {
  const { speed = 0.5, direction = "up" } = options;
  const elementRef = useRef(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;
      const rect = elementRef.current.getBoundingClientRect();
      const scrollPosition = window.pageYOffset;
      const elementTop = rect.top + scrollPosition;
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const distance = scrollPosition - elementTop + windowHeight;
        const movement = distance * speed;
        setOffset(direction === "up" ? -movement : movement);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction]);
  return { elementRef, offset };
};

const Hero = () => {
  const { elementRef: bgRef, offset: bgOffset } = useParallax({ speed: 0.3 });
  const { elementRef: floatRef1, offset: floatOffset1 } = useParallax({ speed: 0.6 });
  const { elementRef: floatRef2, offset: floatOffset2 } = useParallax({ speed: 0.4 });
  return /* @__PURE__ */ jsxs("section", { id: "home", className: "relative min-h-screen flex items-center justify-center overflow-hidden pt-20", children: [
    /* @__PURE__ */ jsxs("div", { ref: bgRef, className: "absolute inset-0 z-0", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: heroImage.src,
          alt: "Prro Health Cllub gym interior",
          className: "w-full h-full object-cover opacity-50",
          style: { transform: `translateY(${bgOffset}px)` }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/70" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-0 overflow-hidden pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { ref: floatRef1, children: /* @__PURE__ */ jsx(
        "img",
        {
          src: dumbbells.src,
          alt: "",
          className: "absolute top-20 left-2 md:left-10 w-32 md:w-48 h-24 md:h-32 object-cover opacity-10 animate-float rounded-lg",
          style: {
            animationDelay: "0s",
            transform: `translateY(${floatOffset1}px)`
          }
        }
      ) }),
      /* @__PURE__ */ jsx("div", { ref: floatRef2, children: /* @__PURE__ */ jsx(
        "img",
        {
          src: tyres.src,
          alt: "",
          className: "absolute bottom-32 right-2 md:right-10 w-40 md:w-56 h-32 md:h-40 object-cover opacity-10 animate-float rounded-lg",
          style: {
            animationDelay: "1s",
            transform: `translateY(${floatOffset2}px)`
          }
        }
      ) }),
      /* @__PURE__ */ jsx(
        "img",
        {
          src: dumbbells.src,
          alt: "",
          className: "hidden md:block absolute top-1/2 right-20 w-40 h-28 object-cover opacity-5 animate-float rounded-lg",
          style: {
            animationDelay: "2s",
            transform: `translateY(${floatOffset1 * 0.7}px)`
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 lg:px-8 z-10 text-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto space-y-8 animate-fade-in", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm md:text-base font-semibold tracking-widest text-primary uppercase", children: "Train with the Best. Become the Best." }),
      /* @__PURE__ */ jsxs("h1", { className: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight", children: [
        "Time to",
        " ",
        /* @__PURE__ */ jsx("span", { className: "gradient-text text-glow", children: "Push" }),
        /* @__PURE__ */ jsx("br", {}),
        "Your Limits"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed", children: "Prro Health Cllub is the best-equipped gym in Kalyan, powered by Being Strong machines. With certified trainers and 15+ years of experience, we help you achieve your fitness goals." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4 pt-4", children: [
        /* @__PURE__ */ jsx("a", { href: "#about", children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "cta",
            size: "lg",
            className: "hover-glow font-bold text-base px-8 py-6 animate-glow-pulse group",
            children: [
              "Get Started",
              /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 group-hover:translate-x-1 transition-transform", size: 20 })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("a", { href: "#about", children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "lg",
            className: "font-bold text-base px-8 py-6 border-2 hover:bg-secondary",
            children: [
              /* @__PURE__ */ jsx(ChevronDown, { className: "mr-2", size: 20 }),
              "Explore More"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3 sm:gap-4 md:gap-8 max-w-3xl mx-auto pt-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl sm:text-3xl md:text-5xl font-black gradient-text", children: "15+" }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1 md:mt-2", children: "Years Experience" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl sm:text-3xl md:text-5xl font-black gradient-text", children: "220+" }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1 md:mt-2", children: "Happy Members" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl sm:text-3xl md:text-5xl font-black gradient-text", children: "5+" }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1 md:mt-2", children: "National Athletes" })
        ] })
      ] })
    ] }) })
  ] });
};

const ownerImage = new Proxy({"src":"/_astro/owner-kalyan.0PUmwoMA.jpg","width":512,"height":512,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/assets/owner-kalyan.jpg";
							}
							
							return target[name];
						}
					});

const gymMachines = new Proxy({"src":"/_astro/gym-machines.C3nAJMO3.jpg","width":1280,"height":720,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/assets/gym-machines.jpg";
							}
							
							return target[name];
						}
					});

const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = true
  } = options;
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(element);
    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);
  return { elementRef, isVisible };
};

const About = () => {
  const { elementRef: sectionRef, isVisible: sectionVisible } = useIntersectionObserver();
  const { elementRef: parallaxRef, offset: parallaxOffset } = useParallax({ speed: 0.4 });
  const highlights = [
    {
      icon: /* @__PURE__ */ jsx(Zap, { className: "w-6 h-6" }),
      title: "Best Equipment",
      description: "Powered by Being Strong machines with daily maintenance"
    },
    {
      icon: /* @__PURE__ */ jsx(Award, { className: "w-6 h-6" }),
      title: "Certified Trainers",
      description: "5+ years of professional training experience"
    },
    {
      icon: /* @__PURE__ */ jsx(Heart, { className: "w-6 h-6" }),
      title: "Clean & Hygienic",
      description: "Daily cleaning and top-notch hygiene standards"
    },
    {
      icon: /* @__PURE__ */ jsx(Target, { className: "w-6 h-6" }),
      title: "Results Driven",
      description: "Proven track record with national athletes"
    }
  ];
  return /* @__PURE__ */ jsxs("section", { ref: sectionRef, id: "about", className: "py-24 bg-secondary/30 relative overflow-hidden scroll-mt-20", children: [
    /* @__PURE__ */ jsx("div", { ref: parallaxRef, className: "hidden lg:block absolute top-20 right-0 w-1/3 h-64 opacity-5 pointer-events-none", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: gymMachines.src,
        alt: "",
        className: "w-full h-full object-cover rounded-l-3xl",
        style: { transform: `translateY(${parallaxOffset}px)` }
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 lg:px-8 relative z-10", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-12 lg:gap-16 items-center", children: [
      /* @__PURE__ */ jsx("div", { className: `relative transition-all duration-700 ${sectionVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`, children: /* @__PURE__ */ jsxs("div", { className: "relative z-10 group", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: ownerImage.src,
            alt: "Mr. Kalyan - Owner of Prro Health Cllub",
            className: "rounded-2xl shadow-2xl w-full max-w-md mx-auto transition-transform duration-500 group-hover:scale-105"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-6 -right-6 bg-primary text-background p-6 rounded-xl shadow-xl animate-glow-pulse", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-black", children: "15+" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: "Years Excellence" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: `space-y-8 transition-all duration-700 delay-200 ${sectionVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-primary font-bold text-sm tracking-widest uppercase mb-3", children: "About Us" }),
          /* @__PURE__ */ jsxs("h2", { className: "text-3xl sm:text-4xl md:text-5xl font-black mb-6", children: [
            "Welcome to ",
            /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Prro Health Cllub" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground leading-relaxed mb-6", children: "Prro Health Cllub is the best-equipped gym in the area, powered by Being Strong machines and maintained with daily cleaning and top-notch hygiene standards. With certified trainers boasting over 5 years of experience, we offer a friendly yet disciplined environment to help every member achieve their fitness goals." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl p-6 hover:border-primary transition-all hover:shadow-xl group", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black mb-3 group-hover:text-primary transition-colors", children: "Meet Mr. Kalyan" }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mb-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-primary font-bold", children: "Runner-up in Mr. Maharashtra" }),
            " | IFSA Certified"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "With 15+ years of experience in professional training and gym management, Mr. Kalyan brings championship-level expertise to every member. His vision: creating a space where discipline meets results." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: highlights.map((item, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-start space-x-3 p-4 rounded-lg bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-primary transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer group",
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-primary mt-1 group-hover:scale-110 transition-transform duration-300", children: item.icon }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-bold mb-1 group-hover:text-primary transition-colors", children: item.title }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: item.description })
              ] })
            ]
          },
          index
        )) })
      ] })
    ] }) })
  ] });
};

const trainerImage = new Proxy({"src":"/_astro/trainer-1.BvoiG9qY.jpg","width":512,"height":512,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/assets/trainer-1.jpg";
							}
							
							return target[name];
						}
					});

const battleRopes = new Proxy({"src":"/_astro/battle-ropes.4c0HWyy3.jpg","width":1280,"height":720,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/assets/battle-ropes.jpg";
							}
							
							return target[name];
						}
					});

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
  return /* @__PURE__ */ jsxs("section", { id: "trainers", className: "py-24 bg-background relative overflow-hidden scroll-mt-20", children: [
    /* @__PURE__ */ jsx("div", { ref: parallaxRef, className: "hidden lg:block absolute bottom-10 left-0 w-1/4 h-48 opacity-5 pointer-events-none", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: battleRopes.src,
        alt: "",
        className: "w-full h-full object-cover rounded-r-3xl",
        style: { transform: `translateY(${parallaxOffset}px)` }
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-8 relative z-10", children: [
      /* @__PURE__ */ jsxs("div", { ref: headerRef, className: `text-center mb-16 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [
        /* @__PURE__ */ jsx("p", { className: "text-primary font-bold text-sm tracking-widest uppercase mb-3", children: "Our Team" }),
        /* @__PURE__ */ jsxs("h2", { className: "text-3xl sm:text-4xl md:text-5xl font-black mb-6", children: [
          "Meet Your ",
          /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Expert Trainers" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-lg text-muted-foreground max-w-3xl mx-auto", children: [
          "Our certified trainers have over 5 years of experience and have trained athletes who've competed nationally. Including ",
          /* @__PURE__ */ jsx("span", { className: "text-primary font-bold", children: "Mr. Yash Pal - 2nd Rank at ICN India" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { ref: cardsRef, className: "grid md:grid-cols-2 lg:grid-cols-3 gap-8", children: trainers.map((trainer, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `group bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-2xl overflow-hidden hover:border-primary transition-all hover-glow hover:-translate-y-2 cursor-pointer ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
          style: {
            transitionDelay: `${index * 150}ms`,
            transitionDuration: "700ms"
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden aspect-square", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: trainer.image.src,
                  alt: trainer.name,
                  className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" }),
              /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 bg-primary text-background px-3 py-1 rounded-full text-xs font-bold animate-glow-pulse", children: trainer.experience })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl sm:text-2xl font-black mb-1 group-hover:text-primary transition-colors", children: trainer.name }),
                /* @__PURE__ */ jsx("p", { className: "text-primary font-semibold text-sm", children: trainer.title })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "Specialization:" }),
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: trainer.specialization })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: trainer.certifications.map((cert, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1 bg-secondary px-3 py-1 rounded-full group-hover:bg-primary group-hover:text-background transition-all", children: [
                /* @__PURE__ */ jsx(Award, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", children: cert })
              ] }, i)) })
            ] })
          ]
        },
        index
      )) })
    ] })
  ] });
};

const Card = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("rounded-lg border bg-[var(--glass-bg)] backdrop-blur-md text-card-foreground shadow-lg border-[var(--glass-border)]", className), ...props }));
Card.displayName = "Card";
const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("h3", { ref, className: cn("text-2xl font-semibold leading-none tracking-tight", className), ...props })
);
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("p", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DialogPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const BMICalculator = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");
  const calculateBMI = () => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    if (heightNum > 0 && weightNum > 0) {
      const heightInMeters = heightNum / 100;
      const bmiValue = weightNum / (heightInMeters * heightInMeters);
      setBmi(parseFloat(bmiValue.toFixed(1)));
      if (bmiValue < 18.5) {
        setCategory("underweight");
      } else if (bmiValue < 25) {
        setCategory("normal");
      } else if (bmiValue < 30) {
        setCategory("overweight");
      } else {
        setCategory("obese");
      }
    }
  };
  const getRecommendations = () => {
    switch (category) {
      case "underweight":
        return {
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          title: "Underweight",
          tips: [
            "Focus on calorie-dense nutritious foods",
            "Strength training to build muscle mass",
            "Eat more frequent meals throughout the day",
            "Include protein-rich foods in every meal"
          ],
          icon: /* @__PURE__ */ jsx(Dumbbell, { className: "h-5 w-5" })
        };
      case "normal":
        return {
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          title: "Healthy Weight",
          tips: [
            "Maintain your current balanced diet",
            "Continue regular exercise routine",
            "Focus on strength and cardiovascular fitness",
            "Stay hydrated and get adequate sleep"
          ],
          icon: /* @__PURE__ */ jsx(Heart, { className: "h-5 w-5" })
        };
      case "overweight":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20",
          title: "Overweight",
          tips: [
            "Create a moderate calorie deficit",
            "Increase cardiovascular exercise",
            "Reduce processed foods and sugars",
            "Track your meals and portions"
          ],
          icon: /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5" })
        };
      case "obese":
        return {
          color: "text-red-400",
          bgColor: "bg-red-500/20",
          title: "Obese",
          tips: [
            "Consult with a healthcare professional",
            "Start with low-impact exercises",
            "Focus on whole foods and vegetables",
            "Set small, achievable goals"
          ],
          icon: /* @__PURE__ */ jsx(Scale, { className: "h-5 w-5" })
        };
      default:
        return null;
    }
  };
  const recommendations = getRecommendations();
  const resetCalculator = () => {
    setHeight("");
    setWeight("");
    setBmi(null);
    setCategory("");
  };
  return /* @__PURE__ */ jsxs(Dialog, { onOpenChange: (open) => !open && resetCalculator(), children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2 hover:bg-primary hover:text-primary-foreground transition-colors", children: [
      /* @__PURE__ */ jsx(Calculator, { className: "h-5 w-5" }),
      "Calculate Your BMI"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[425px] bg-card border-border", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { className: "text-2xl font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Calculator, { className: "h-6 w-6 text-primary" }),
        "BMI Calculator"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6 py-4", children: !bmi ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "height", children: "Height (cm)" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "height",
              type: "number",
              placeholder: "Enter your height in cm",
              value: height,
              onChange: (e) => setHeight(e.target.value),
              className: "bg-secondary/50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "weight", children: "Weight (kg)" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "weight",
              type: "number",
              placeholder: "Enter your weight in kg",
              value: weight,
              onChange: (e) => setWeight(e.target.value),
              className: "bg-secondary/50"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: calculateBMI,
            className: "w-full",
            variant: "cta",
            disabled: !height || !weight,
            children: "Calculate BMI"
          }
        )
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center p-6 rounded-xl bg-secondary/30 border border-border", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "Your BMI" }),
          /* @__PURE__ */ jsx("p", { className: `text-5xl font-bold ${recommendations?.color}`, children: bmi }),
          /* @__PURE__ */ jsx("p", { className: `text-lg font-semibold mt-2 ${recommendations?.color}`, children: recommendations?.title })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "h-3 rounded-full overflow-hidden flex", children: [
            /* @__PURE__ */ jsx("div", { className: "w-1/4 bg-blue-500" }),
            /* @__PURE__ */ jsx("div", { className: "w-1/4 bg-green-500" }),
            /* @__PURE__ */ jsx("div", { className: "w-1/4 bg-yellow-500" }),
            /* @__PURE__ */ jsx("div", { className: "w-1/4 bg-red-500" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "Under 18.5" }),
            /* @__PURE__ */ jsx("span", { children: "18.5-24.9" }),
            /* @__PURE__ */ jsx("span", { children: "25-29.9" }),
            /* @__PURE__ */ jsx("span", { children: "30+" })
          ] })
        ] }),
        recommendations && /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl ${recommendations.bgColor} border border-border`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx("span", { className: recommendations.color, children: recommendations.icon }),
            /* @__PURE__ */ jsx("h4", { className: "font-semibold", children: "Fitness Recommendations" })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: recommendations.tips.map((tip, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-primary mt-1", children: "•" }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: tip })
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: resetCalculator,
            variant: "outline",
            className: "w-full",
            children: "Calculate Again"
          }
        )
      ] }) })
    ] })
  ] });
};

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Label, { ref, className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className), ...props }));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Separator, { ref, className: cn("-mx-1 my-1 h-px bg-muted", className), ...props }));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

const BodyFatCalculator = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");
  const [bodyFat, setBodyFat] = useState(null);
  const [category, setCategory] = useState("");
  const calculateBodyFat = () => {
    const heightNum = parseFloat(height);
    const waistNum = parseFloat(waist);
    const neckNum = parseFloat(neck);
    const hipNum = parseFloat(hip);
    if (!gender || heightNum <= 0 || waistNum <= 0 || neckNum <= 0) {
      return;
    }
    let bodyFatValue;
    if (gender === "male") {
      bodyFatValue = 495 / (1.0324 - 0.19077 * Math.log10(waistNum - neckNum) + 0.15456 * Math.log10(heightNum)) - 450;
    } else if (gender === "female") {
      if (hipNum <= 0) return;
      bodyFatValue = 495 / (1.29579 - 0.35004 * Math.log10(waistNum + hipNum - neckNum) + 0.221 * Math.log10(heightNum)) - 450;
    } else {
      return;
    }
    bodyFatValue = Math.max(0, Math.min(60, bodyFatValue));
    setBodyFat(parseFloat(bodyFatValue.toFixed(1)));
    if (gender === "male") {
      if (bodyFatValue < 6) setCategory("essential");
      else if (bodyFatValue < 14) setCategory("athletic");
      else if (bodyFatValue < 18) setCategory("fitness");
      else if (bodyFatValue < 25) setCategory("average");
      else setCategory("obese");
    } else {
      if (bodyFatValue < 14) setCategory("essential");
      else if (bodyFatValue < 21) setCategory("athletic");
      else if (bodyFatValue < 25) setCategory("fitness");
      else if (bodyFatValue < 32) setCategory("average");
      else setCategory("obese");
    }
  };
  const getRecommendations = () => {
    switch (category) {
      case "essential":
        return {
          color: "text-purple-400",
          bgColor: "bg-purple-500/20",
          title: "Essential Fat",
          tips: [
            "This is the minimum level needed for health",
            "Focus on maintaining proper nutrition",
            "Ensure adequate caloric intake",
            "Monitor health markers regularly"
          ],
          icon: /* @__PURE__ */ jsx(Heart, { className: "h-5 w-5" })
        };
      case "athletic":
        return {
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          title: "Athletic",
          tips: [
            "Excellent fitness level achieved",
            "Maintain balanced training routine",
            "Focus on performance optimization",
            "Continue with structured nutrition"
          ],
          icon: /* @__PURE__ */ jsx(Dumbbell, { className: "h-5 w-5" })
        };
      case "fitness":
        return {
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          title: "Fitness",
          tips: [
            "Great body composition level",
            "Continue regular exercise routine",
            "Maintain balanced diet habits",
            "Consider strength training for definition"
          ],
          icon: /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5" })
        };
      case "average":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20",
          title: "Average",
          tips: [
            "Room for improvement exists",
            "Increase cardiovascular activity",
            "Focus on reducing processed foods",
            "Aim for consistent workout schedule"
          ],
          icon: /* @__PURE__ */ jsx(Scale, { className: "h-5 w-5" })
        };
      case "obese":
        return {
          color: "text-red-400",
          bgColor: "bg-red-500/20",
          title: "Above Average",
          tips: [
            "Consult with a fitness professional",
            "Start with moderate exercise program",
            "Focus on whole foods and vegetables",
            "Set realistic, achievable goals"
          ],
          icon: /* @__PURE__ */ jsx(TrendingDown, { className: "h-5 w-5" })
        };
      default:
        return null;
    }
  };
  const recommendations = getRecommendations();
  const resetCalculator = () => {
    setAge("");
    setGender("");
    setHeight("");
    setWeight("");
    setWaist("");
    setNeck("");
    setHip("");
    setBodyFat(null);
    setCategory("");
  };
  const isFormValid = () => {
    const baseValid = age && gender && height && waist && neck;
    if (gender === "female") {
      return baseValid && hip;
    }
    return baseValid;
  };
  return /* @__PURE__ */ jsxs(Dialog, { onOpenChange: (open) => !open && resetCalculator(), children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2 hover:bg-primary hover:text-primary-foreground transition-colors", children: [
      /* @__PURE__ */ jsx(Percent, { className: "h-5 w-5" }),
      "Calculate Body Fat %"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[450px] bg-card border-border max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { className: "text-2xl font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Percent, { className: "h-6 w-6 text-primary" }),
        "Body Fat Calculator"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4 py-4", children: !bodyFat ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "age", children: "Age" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "age",
                type: "number",
                placeholder: "Years",
                value: age,
                onChange: (e) => setAge(e.target.value),
                className: "bg-secondary/50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "gender", children: "Gender" }),
            /* @__PURE__ */ jsxs(Select, { value: gender, onValueChange: setGender, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "bg-secondary/50", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select" }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "male", children: "Male" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "female", children: "Female" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "bf-height", children: "Height (cm)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "bf-height",
                type: "number",
                placeholder: "Height in cm",
                value: height,
                onChange: (e) => setHeight(e.target.value),
                className: "bg-secondary/50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "bf-weight", children: "Weight (kg)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "bf-weight",
                type: "number",
                placeholder: "Weight in kg",
                value: weight,
                onChange: (e) => setWeight(e.target.value),
                className: "bg-secondary/50"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "waist", children: "Waist (cm)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "waist",
                type: "number",
                placeholder: "At navel level",
                value: waist,
                onChange: (e) => setWaist(e.target.value),
                className: "bg-secondary/50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "neck", children: "Neck (cm)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "neck",
                type: "number",
                placeholder: "Below larynx",
                value: neck,
                onChange: (e) => setNeck(e.target.value),
                className: "bg-secondary/50"
              }
            )
          ] })
        ] }),
        gender === "female" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "hip", children: "Hip (cm)" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "hip",
              type: "number",
              placeholder: "At widest point",
              value: hip,
              onChange: (e) => setHip(e.target.value),
              className: "bg-secondary/50"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Uses the US Navy Method formula for accurate body fat estimation." }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: calculateBodyFat,
            className: "w-full",
            variant: "cta",
            disabled: !isFormValid(),
            children: "Calculate Body Fat %"
          }
        )
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center p-6 rounded-xl bg-secondary/30 border border-border", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "Your Body Fat" }),
          /* @__PURE__ */ jsxs("p", { className: `text-5xl font-bold ${recommendations?.color}`, children: [
            bodyFat,
            "%"
          ] }),
          /* @__PURE__ */ jsx("p", { className: `text-lg font-semibold mt-2 ${recommendations?.color}`, children: recommendations?.title })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "h-3 rounded-full overflow-hidden flex", children: [
            /* @__PURE__ */ jsx("div", { className: "w-1/5 bg-purple-500" }),
            /* @__PURE__ */ jsx("div", { className: "w-1/5 bg-blue-500" }),
            /* @__PURE__ */ jsx("div", { className: "w-1/5 bg-green-500" }),
            /* @__PURE__ */ jsx("div", { className: "w-1/5 bg-yellow-500" }),
            /* @__PURE__ */ jsx("div", { className: "w-1/5 bg-red-500" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "Essential" }),
            /* @__PURE__ */ jsx("span", { children: "Athletic" }),
            /* @__PURE__ */ jsx("span", { children: "Fitness" }),
            /* @__PURE__ */ jsx("span", { children: "Average" }),
            /* @__PURE__ */ jsx("span", { children: "High" })
          ] })
        ] }),
        recommendations && /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl ${recommendations.bgColor} border border-border`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx("span", { className: recommendations.color, children: recommendations.icon }),
            /* @__PURE__ */ jsx("h4", { className: "font-semibold", children: "Fitness Recommendations" })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: recommendations.tips.map((tip, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-primary mt-1", children: "•" }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: tip })
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: resetCalculator,
            variant: "outline",
            className: "w-full",
            children: "Calculate Again"
          }
        )
      ] }) })
    ] })
  ] });
};

const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After"
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, x / rect.width * 100));
    setSliderPosition(percentage);
  }, []);
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);
  const handleTouchMove = useCallback((e) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: "relative w-full aspect-[3/4] overflow-hidden rounded-xl cursor-ew-resize select-none group",
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleMouseUp,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: afterImage,
              alt: "After",
              className: "w-full h-full object-cover",
              draggable: false
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-primary-foreground", children: afterLabel }) })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "absolute inset-0 overflow-hidden",
            style: { clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` },
            children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: beforeImage,
                  alt: "Before",
                  className: "w-full h-full object-cover",
                  draggable: false
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-4 bg-secondary/90 backdrop-blur-sm px-3 py-1.5 rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-foreground", children: beforeLabel }) })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-10 transition-transform",
            style: { left: `${sliderPosition}%`, transform: "translateX(-50%)" },
            onMouseDown: handleMouseDown,
            onTouchStart: handleMouseDown,
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 group-hover:scale-105",
                onMouseDown: handleMouseDown,
                onTouchStart: handleMouseDown,
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
                  /* @__PURE__ */ jsx(
                    "svg",
                    {
                      className: "w-4 h-4 text-primary-foreground rotate-180",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                      children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M9 5l7 7-7 7" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "svg",
                    {
                      className: "w-4 h-4 text-primary-foreground",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                      children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M9 5l7 7-7 7" })
                    }
                  )
                ] })
              }
            )
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" })
      ]
    }
  );
};

const Transformations = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { elementRef: heroRef, isVisible: heroVisible } = useIntersectionObserver();
  const { elementRef: carouselRef, isVisible: carouselVisible } = useIntersectionObserver();
  useIntersectionObserver();
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("section", { ref: heroRef, id: "transformations", className: "relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-background to-background/80", children: /* @__PURE__ */ jsxs("div", { className: `container mx-auto px-4 text-center transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-5xl md:text-7xl font-bold mb-6", children: [
        "Witness the ",
        /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Transformations" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground max-w-3xl mx-auto mb-8", children: "The changes are not just skin-deep through what achieves real personal goals that work and a powerful influence of their physique & mental health." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-4", children: [
        /* @__PURE__ */ jsx(BMICalculator, {}),
        /* @__PURE__ */ jsx(BodyFatCalculator, {})
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 bg-secondary/30", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4", children: [
      /* @__PURE__ */ jsxs("div", { ref: carouselRef, className: `text-center mb-12 transition-all duration-700 ${carouselVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl md:text-5xl font-bold mb-4", children: "Real Results, Real People" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "See the incredible transformations of our students who pushed their limits and achieved their fitness goals." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative max-w-6xl mx-auto", children: [
        /* @__PURE__ */ jsx("div", { className: `grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transition-all duration-700 ${carouselVisible ? "opacity-100" : "opacity-0"}`, children: displayedTransformations.slice(0, visibleCards).map((transformation, index) => /* @__PURE__ */ jsxs(
          Card,
          {
            className: "group relative overflow-hidden bg-[var(--glass-bg)] backdrop-blur-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-[var(--glass-border)]",
            children: [
              /* @__PURE__ */ jsx(
                BeforeAfterSlider,
                {
                  beforeImage: transformation.beforeImage,
                  afterImage: transformation.afterImage,
                  beforeLabel: transformation.beforeWeight,
                  afterLabel: transformation.afterWeight
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-1", children: transformation.name }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: transformation.duration })
              ] })
            ]
          },
          `${transformation.name}-${index}`
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "icon",
              onClick: prevSlide,
              className: "rounded-full hover:bg-primary hover:text-primary-foreground transition-colors",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "icon",
              onClick: nextSlide,
              className: "rounded-full hover:bg-primary hover:text-primary-foreground transition-colors",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-6 w-6" })
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4", children: [
      /* @__PURE__ */ jsxs("div", { ref: testimonialsRef, className: `text-center mb-12 transition-all duration-700 ${testimonialsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-4xl md:text-5xl font-bold mb-4", children: [
          "Real Results, ",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Real Stories" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "Every individual at R Fitness, but our common ground is transformation. Explore the super-power of our success." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto", children: testimonials.map((testimonial, index) => /* @__PURE__ */ jsxs(
        Card,
        {
          className: `p-8 bg-[var(--glass-bg)] backdrop-blur-md hover:shadow-xl transition-all hover:-translate-y-1 border-[var(--glass-border)] ${testimonialsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
          style: {
            transitionDelay: `${index * 150}ms`,
            transitionDuration: "700ms"
          },
          children: [
            /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed italic", children: [
              '"',
              testimonial.text,
              '"'
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: testimonial.avatar,
                  alt: testimonial.author,
                  className: "w-12 h-12 rounded-full object-cover"
                }
              ),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "font-semibold text-primary", children: testimonial.author }) })
            ] })
          ]
        },
        index
      )) })
    ] }) })
  ] });
};

const equipmentImage = new Proxy({"src":"/_astro/equipment.Dp50GXKd.jpg","width":800,"height":600,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/assets/equipment.jpg";
							}
							
							return target[name];
						}
					});

const Services = () => {
  const { elementRef: headerRef, isVisible: headerVisible } = useIntersectionObserver();
  const { elementRef: cardsRef, isVisible: cardsVisible } = useIntersectionObserver();
  const { elementRef: parallaxRef, offset: parallaxOffset } = useParallax({ speed: 0.5 });
  const mainServices = [
    {
      icon: /* @__PURE__ */ jsx(Dumbbell, { className: "w-8 h-8" }),
      title: "Strength Training",
      description: "Build muscle and power with Being Strong machines and expert guidance",
      image: dumbbells
    },
    {
      icon: /* @__PURE__ */ jsx(Activity, { className: "w-8 h-8" }),
      title: "CrossFit",
      description: "High-intensity functional training for total body transformation",
      image: battleRopes
    },
    {
      icon: /* @__PURE__ */ jsx(User, { className: "w-8 h-8" }),
      title: "Personal Training",
      description: "One-on-one customized training with certified professionals",
      image: gymMachines
    },
    {
      icon: /* @__PURE__ */ jsx(TrendingDown, { className: "w-8 h-8" }),
      title: "Weight Loss",
      description: "Personalized programs to help you achieve your ideal weight",
      image: tyres
    },
    {
      icon: /* @__PURE__ */ jsx(TrendingUp, { className: "w-8 h-8" }),
      title: "Muscle Gain",
      description: "Scientifically designed programs for maximum muscle growth",
      image: dumbbells
    },
    {
      icon: /* @__PURE__ */ jsx(Heart, { className: "w-8 h-8" }),
      title: "Cardio",
      description: "Improve cardiovascular health and endurance",
      image: battleRopes
    },
    {
      icon: /* @__PURE__ */ jsx(Package, { className: "w-8 h-8" }),
      title: "BEING STRONG Equipments",
      description: "2 set of machine in every equipment",
      image: equipmentImage
    },
    {
      icon: /* @__PURE__ */ jsx(Users, { className: "w-8 h-8" }),
      title: "Co-operative Staff",
      description: "Friendly and helpful staff ready to assist you with your fitness journey",
      image: gymMachines
    }
  ];
  const additionalFacilities = [
    { icon: /* @__PURE__ */ jsx(Droplets, { className: "w-5 h-5" }), text: "Free Water" },
    { icon: /* @__PURE__ */ jsx(UtensilsCrossed, { className: "w-5 h-5" }), text: "Personalized Diet Plans" },
    { icon: /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5" }), text: "Secure Locker Rooms" }
  ];
  return /* @__PURE__ */ jsxs("section", { id: "services", className: "py-24 bg-secondary/30 relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { ref: parallaxRef, className: "absolute inset-0 opacity-5", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: equipmentImage.src,
        alt: "",
        className: "w-full h-full object-cover",
        style: { transform: `translateY(${parallaxOffset}px)` }
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-8 relative z-10", children: [
      /* @__PURE__ */ jsxs("div", { ref: headerRef, className: `text-center mb-16 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [
        /* @__PURE__ */ jsx("p", { className: "text-primary font-bold text-sm tracking-widest uppercase mb-3", children: "What We Offer" }),
        /* @__PURE__ */ jsxs("h2", { className: "text-4xl md:text-5xl font-black mb-6", children: [
          "Our ",
          /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Services" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-3xl mx-auto", children: "From strength training to personalized nutrition plans, we provide everything you need to transform your fitness journey." })
      ] }),
      /* @__PURE__ */ jsx("div", { ref: cardsRef, className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12", children: mainServices.map((service, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `relative bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl overflow-hidden hover:border-primary transition-all hover-glow group hover:-translate-y-2 cursor-pointer ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
          style: {
            transitionDelay: `${index * 100}ms`,
            transitionDuration: "700ms"
          },
          children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: service.image.src,
                alt: "",
                className: "w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "relative p-8", children: [
              /* @__PURE__ */ jsx("div", { className: "text-primary mb-4 group-hover:scale-110 transition-transform duration-300", children: service.icon }),
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-black mb-3 group-hover:text-primary transition-colors", children: service.title }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: service.description })
            ] })
          ]
        },
        index
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[var(--glass-bg)] backdrop-blur-md border border-primary/30 rounded-2xl p-8 animate-fade-in hover:shadow-2xl transition-shadow", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black mb-6 text-center", children: "Additional Facilities" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-6", children: additionalFacilities.map((facility, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center space-x-3 bg-secondary px-6 py-3 rounded-full hover:bg-primary hover:text-background transition-all cursor-pointer hover:scale-105",
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-current", children: facility.icon }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: facility.text })
            ]
          },
          index
        )) })
      ] })
    ] })
  ] });
};

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
        "Unlimited visit"
      ],
      highlighted: false
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
        "Unlimited visit"
      ],
      highlighted: false
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
        "Free supplements guide"
      ],
      highlighted: true
    }
  ];
  return /* @__PURE__ */ jsxs("section", { id: "pricing", className: "py-20 bg-background relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" }),
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 relative z-10", children: [
      /* @__PURE__ */ jsxs("div", { ref: headerRef, className: `text-center mb-16 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-4xl md:text-5xl font-bold mb-4", children: [
          "Personal Training ",
          /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Packages" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg max-w-2xl mx-auto", children: "With diverse packages tailored to your needs and goals, let's choose the best plan for you on your healthy living journey." })
      ] }),
      /* @__PURE__ */ jsx("div", { ref: cardsRef, className: "grid md:grid-cols-3 gap-8 max-w-6xl mx-auto", children: packages.map((pkg, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `relative rounded-2xl p-8 backdrop-blur-md transition-all hover:scale-105 ${pkg.highlighted ? "bg-primary text-primary-foreground shadow-[0_0_60px_rgba(255,87,34,0.4)] animate-glow-pulse" : "bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-primary/50"} ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
          style: {
            transitionDelay: `${index * 150}ms`,
            transitionDuration: "700ms"
          },
          children: [
            pkg.highlighted && /* @__PURE__ */ jsx("div", { className: "absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary px-6 py-2 rounded-full", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-primary", children: "MOST POPULAR" }) }),
            /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
              /* @__PURE__ */ jsx("h3", { className: `text-2xl font-bold mb-2 ${pkg.highlighted ? "" : "text-foreground"}`, children: pkg.name }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 mb-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-5xl font-bold", children: [
                  "₹",
                  pkg.price
                ] }),
                /* @__PURE__ */ jsxs("span", { className: `text-lg line-through ${pkg.highlighted ? "opacity-70" : "text-muted-foreground"}`, children: [
                  "₹",
                  pkg.originalPrice
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: `text-sm ${pkg.highlighted ? "opacity-90" : "text-muted-foreground"}`, children: pkg.description })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                className: `w-full mb-6 ${pkg.highlighted ? "bg-background text-primary hover:bg-background/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`,
                size: "lg",
                children: "Get started"
              }
            ),
            /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: pkg.features.map((feature, featureIndex) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx(
                Check,
                {
                  className: `w-5 h-5 flex-shrink-0 mt-0.5 ${pkg.highlighted ? "text-background" : "text-primary"}`
                }
              ),
              /* @__PURE__ */ jsx("span", { className: `text-sm ${pkg.highlighted ? "" : "text-foreground"}`, children: feature })
            ] }, featureIndex)) })
          ]
        },
        index
      )) }),
      /* @__PURE__ */ jsx("div", { className: "text-center mt-12 animate-fade-in", children: /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
        "All packages include access to our premium equipment and facilities.",
        /* @__PURE__ */ jsx("span", { className: "text-primary font-semibold", children: " Contact us" }),
        " for custom plans."
      ] }) })
    ] })
  ] });
};

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      className: cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}

const Contact = () => {
  const { toast } = useToast();
  const { elementRef: headerRef, isVisible: headerVisible } = useIntersectionObserver();
  const { elementRef: contentRef, isVisible: contentVisible } = useIntersectionObserver();
  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you soon."
    });
  };
  const contactInfo = [
    {
      icon: /* @__PURE__ */ jsx(Phone, { className: "w-6 h-6" }),
      title: "Phone",
      value: "+91 9867016344",
      link: "tel:+919867016344"
    },
    {
      icon: /* @__PURE__ */ jsx(Mail, { className: "w-6 h-6" }),
      title: "Email",
      value: "prohealthclubkalyan@gmail.com",
      link: "mailto:prohealthclubkalyan@gmail.com"
    },
    {
      icon: /* @__PURE__ */ jsx(MapPin, { className: "w-6 h-6" }),
      title: "Location",
      value: "Janta Bank, Malangad Rd, behind Kalyan, Gopal Krishna Nagar, Kalyan East, Maharashtra 421306",
      link: "https://maps.google.com/?q=Gopal+Krishna+Nagar+Kalyan+East"
    },
    {
      icon: /* @__PURE__ */ jsx(Instagram, { className: "w-6 h-6" }),
      title: "Instagram",
      value: "@prrohealthcllub",
      link: "https://www.instagram.com/prrohealthcllub"
    }
  ];
  return /* @__PURE__ */ jsx("section", { id: "contact", className: "py-24 bg-background", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { ref: headerRef, className: `text-center mb-16 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [
      /* @__PURE__ */ jsx("p", { className: "text-primary font-bold text-sm tracking-widest uppercase mb-3", children: "Get In Touch" }),
      /* @__PURE__ */ jsxs("h2", { className: "text-4xl md:text-5xl font-black mb-6", children: [
        "Start Your ",
        /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Transformation" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-3xl mx-auto", children: "Ready to take the first step? Contact us today for a free consultation or visit our gym in Kalyan." })
    ] }),
    /* @__PURE__ */ jsxs("div", { ref: contentRef, className: "grid lg:grid-cols-2 gap-12", children: [
      /* @__PURE__ */ jsx("div", { className: `space-y-6 transition-all duration-700 ${contentVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`, children: contactInfo.map((info, index) => /* @__PURE__ */ jsxs(
        "a",
        {
          href: info.link,
          target: info.link.startsWith("http") ? "_blank" : void 0,
          rel: info.link.startsWith("http") ? "noopener noreferrer" : void 0,
          className: "flex items-start space-x-4 p-6 bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl hover:border-primary transition-all hover-glow hover:-translate-y-1 group",
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-primary group-hover:scale-110 transition-transform mt-1", children: info.icon }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-bold text-sm text-muted-foreground mb-1 group-hover:text-primary transition-colors", children: info.title }),
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground", children: info.value })
            ] })
          ]
        },
        index
      )) }),
      /* @__PURE__ */ jsx("div", { className: `transition-all duration-700 delay-200 ${contentVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`, children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-2xl p-8 hover:border-primary/50 transition-all", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-semibold mb-2", children: "Your Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "name",
              type: "text",
              placeholder: "John Doe",
              required: true,
              className: "bg-background border-border focus:border-primary transition-colors"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-semibold mb-2", children: "Email Address" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "email",
              type: "email",
              placeholder: "john@example.com",
              required: true,
              className: "bg-background border-border focus:border-primary transition-colors"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-sm font-semibold mb-2", children: "Phone Number" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "phone",
              type: "tel",
              placeholder: "+91 98670 16344",
              required: true,
              className: "bg-background border-border focus:border-primary transition-colors"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "message", className: "block text-sm font-semibold mb-2", children: "Message" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              id: "message",
              placeholder: "Tell us about your fitness goals...",
              rows: 4,
              required: true,
              className: "bg-background border-border resize-none focus:border-primary transition-colors"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", variant: "default", size: "lg", className: "w-full hover-glow font-bold animate-glow-pulse", children: "Send Message" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-16 animate-fade-in", children: /* @__PURE__ */ jsx("div", { className: "rounded-2xl overflow-hidden border border-border shadow-2xl h-96", children: /* @__PURE__ */ jsx(
      "iframe",
      {
        src: "https://maps.google.com/maps?q=Pro+Health+Club+Kalyan+East+Maharashtra+421306&t=&z=15&ie=UTF8&iwloc=&output=embed",
        width: "100%",
        height: "100%",
        style: { border: 0 },
        allowFullScreen: true,
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade",
        title: "Prro Health Cllub Location"
      }
    ) }) })
  ] }) });
};

const Footer = () => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsx("footer", { className: "bg-secondary/30 border-t border-border py-12", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-8 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: logo.src,
              alt: "Prro Health Cllub Logo",
              className: "h-12 w-12 object-contain"
            }
          ),
          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black gradient-text", children: "Prro Health Cllub" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Train with the Best. Become the Best." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-bold mb-4", children: "Quick Links" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: ["Home", "About", "Trainers", "Services", "Contact"].map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "a",
          {
            href: `#${item.toLowerCase()}`,
            className: "text-muted-foreground hover:text-primary transition-colors",
            children: item
          }
        ) }, item)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-bold mb-4", children: "Connect With Us" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("a", { href: "tel:+919867016344", className: "flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors", children: [
            /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "+91 9867016344" })
          ] }),
          /* @__PURE__ */ jsxs("a", { href: "mailto:prohealthclubkalyan@gmail.com", className: "flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors", children: [
            /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "prohealthclubkalyan@gmail.com" })
          ] }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://www.instagram.com/prrohealthcllub",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors",
              children: [
                /* @__PURE__ */ jsx(Instagram, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { children: "@prrohealthcllub" })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-border pt-8 text-center text-muted-foreground text-sm", children: /* @__PURE__ */ jsxs("p", { children: [
      "© ",
      currentYear,
      " Prro Health Cllub. All rights reserved. | Designed with 💪 for fitness excellence."
    ] }) })
  ] }) });
};

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(ScrollAreaPrimitive.Root, { ref, className: cn("relative overflow-hidden", className), ...props, children: [
  /* @__PURE__ */ jsx(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }),
  /* @__PURE__ */ jsx(ScrollBar, {}),
  /* @__PURE__ */ jsx(ScrollAreaPrimitive.Corner, {})
] }));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx(
  ScrollAreaPrimitive.ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = {
        id: Date.now().toString(),
        text: "Hello! 👋 Welcome to Prro Health Cllub! I'm here to help you with any questions about our gym, memberships, trainers, and services. How can I assist you today?",
        isBot: true,
        timestamp: /* @__PURE__ */ new Date()
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase().trim();
    if (message.match(/^(hi|hello|hey|good morning|good evening|good afternoon)/)) {
      return "Hello! How can I help you today? Feel free to ask about our gym hours, memberships, trainers, or services!";
    }
    if (message.includes("hour") || message.includes("time") || message.includes("open") || message.includes("close")) {
      return "We're open Monday to Saturday from 6:00 AM to 10:00 PM, and Sunday from 7:00 AM to 8:00 PM. Come visit us anytime!";
    }
    if (message.includes("price") || message.includes("cost") || message.includes("membership") || message.includes("plan") || message.includes("fee")) {
      return "We offer several membership plans:\n\n💪 Basic Plan: ₹2,999/month - Access to gym and basic equipment\n🏋️ Premium Plan: ₹4,999/month - Includes all facilities + group classes\n⭐ Elite Plan: ₹7,999/month - Everything + personal training sessions\n\nWould you like to know more about any specific plan?";
    }
    if (message.includes("trainer") || message.includes("coach") || message.includes("instructor")) {
      return "We have a team of certified professional trainers specializing in various areas:\n\n- Personal Training\n- Strength & Conditioning\n- Weight Loss Programs\n- Muscle Building\n- Functional Fitness\n\nEach trainer is highly experienced and dedicated to helping you achieve your fitness goals!";
    }
    if (message.includes("service") || message.includes("facility") || message.includes("offer") || message.includes("amenity")) {
      return "Our services include:\n\n✅ State-of-the-art gym equipment\n✅ Group fitness classes (Yoga, Zumba, CrossFit)\n✅ Personal training sessions\n✅ Body composition analysis\n✅ Nutrition guidance\n✅ Cardio zone\n✅ Strength training area\n✅ Locker rooms and showers\n\nWhat would you like to know more about?";
    }
    if (message.includes("bmi") || message.includes("body fat") || message.includes("composition") || message.includes("assessment")) {
      return "We offer comprehensive body composition assessments including:\n\n📊 BMI Calculator\n📊 Body Fat Percentage Analysis\n📊 Muscle Mass Measurement\n📊 Personalized Fitness Recommendations\n\nThese assessments help us create customized workout and nutrition plans for you!";
    }
    if (message.includes("location") || message.includes("address") || message.includes("where") || message.includes("find")) {
      return "We're conveniently located in the heart of the city! For our exact address and directions, please check the Contact section on our website or call us at +91 98670 16344.";
    }
    if (message.includes("contact") || message.includes("phone") || message.includes("call") || message.includes("email") || message.includes("reach")) {
      return "You can reach us at:\n\n📞 Phone: +91 98670 16344\n📧 Email: info@prrohealthcllub.com\n💬 WhatsApp: Click the WhatsApp button on our website\n\nWe're always happy to help!";
    }
    if (message.includes("transformation") || message.includes("result") || message.includes("success")) {
      return "Our transformation programs have helped hundreds of members achieve incredible results! We offer:\n\n🎯 Customized workout plans\n🎯 Nutrition coaching\n🎯 Progress tracking\n🎯 Constant support from trainers\n\nCheck out our Transformations section to see real success stories!";
    }
    if (message.includes("class") || message.includes("yoga") || message.includes("zumba") || message.includes("crossfit")) {
      return "We offer exciting group fitness classes:\n\n🧘 Yoga - Mon, Wed, Fri at 7 AM & 6 PM\n💃 Zumba - Tue, Thu, Sat at 6 PM\n🏋️ CrossFit - Mon-Sat at 8 AM\n🤸 Functional Training - Daily at 5 PM\n\nAll classes are included with Premium and Elite memberships!";
    }
    if (message.includes("join") || message.includes("sign up") || message.includes("register") || message.includes("start")) {
      return "Great to hear you're interested in joining! 🎉\n\nYou can:\n1. Visit us in person for a free tour\n2. Fill out the contact form on our website\n3. Call us at +91 98670 16344\n4. Message us on WhatsApp\n\nWe offer a FREE 3-day trial for new members!";
    }
    if (message.includes("thank") || message.includes("thanks")) {
      return "You're very welcome! 😊 If you have any other questions, feel free to ask. We're here to help you on your fitness journey!";
    }
    if (message.includes("bye") || message.includes("goodbye") || message.includes("see you")) {
      return "Goodbye! Thanks for chatting with us. Feel free to come back anytime. Stay fit and healthy! 💪";
    }
    return "I'd be happy to help you with that! For specific questions, you can:\n\n- Ask about our gym hours\n- Inquire about membership plans\n- Learn about our trainers and services\n- Get contact information\n\nOr feel free to call us at +91 98670 16344 for personalized assistance!";
  };
  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: /* @__PURE__ */ new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: /* @__PURE__ */ new Date()
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const quickReplies = [
    "Membership plans",
    "Gym hours",
    "Our trainers",
    "Contact info"
  ];
  const handleQuickReply = (reply) => {
    setInputValue(reply);
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md h-[600px] bg-gradient-to-br from-[var(--glass-primary)] to-[var(--glass-secondary)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b border-[var(--glass-border)] bg-gradient-to-r from-primary/20 to-primary/10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(Bot, { className: "h-6 w-6 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg", children: "Gym Assistant" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Always here to help" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: onClose,
          size: "icon",
          variant: "ghost",
          className: "h-8 w-8 rounded-full hover:bg-white/10",
          children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 p-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      messages.map((message) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex gap-2 ${message.isBot ? "justify-start" : "justify-end"}`,
          children: [
            message.isBot && /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5 text-primary" }) }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: `max-w-[75%] rounded-2xl px-4 py-2 ${message.isBot ? "bg-white/10 backdrop-blur-sm border border-white/20" : "bg-primary text-primary-foreground"}`,
                children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-line", children: message.text }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs opacity-60 mt-1", children: message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  }) })
                ]
              }
            ),
            !message.isBot && /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-primary-foreground" }) })
          ]
        },
        message.id
      )),
      isTyping && /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-start", children: [
        /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-primary/60 rounded-full animate-bounce", style: { animationDelay: "0ms" } }),
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-primary/60 rounded-full animate-bounce", style: { animationDelay: "150ms" } }),
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-primary/60 rounded-full animate-bounce", style: { animationDelay: "300ms" } })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { ref: scrollRef })
    ] }) }),
    messages.length > 0 && messages[messages.length - 1]?.isBot && !isTyping && /* @__PURE__ */ jsxs("div", { className: "px-4 pb-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Quick questions:" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: quickReplies.map((reply) => /* @__PURE__ */ jsx(
        Button,
        {
          onClick: () => handleQuickReply(reply),
          variant: "outline",
          size: "sm",
          className: "text-xs bg-white/5 hover:bg-white/10 border-white/20",
          children: reply
        },
        reply
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-[var(--glass-border)] bg-white/5", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          value: inputValue,
          onChange: (e) => setInputValue(e.target.value),
          onKeyPress: handleKeyPress,
          placeholder: "Type your message...",
          className: "flex-1 bg-white/10 border-white/20 focus:border-primary"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: handleSend,
          size: "icon",
          className: "bg-primary hover:bg-primary/90",
          disabled: !inputValue.trim(),
          children: /* @__PURE__ */ jsx(Send, { className: "h-5 w-5" })
        }
      )
    ] }) })
  ] }) });
};

const WhatsAppIcon = ({ className }) => /* @__PURE__ */ jsx(
  "svg",
  {
    viewBox: "0 0 24 24",
    className,
    fill: "currentColor",
    xmlns: "http://www.w3.org/2000/svg",
    children: /* @__PURE__ */ jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" })
  }
);
const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const makeCall = () => {
    window.location.href = "tel:+919867016344";
  };
  const whatsappChat = () => {
    const phoneNumber = "919867016344";
    const message = encodeURIComponent(
      "Hello! I would like to know more about Prro Health Cllub membership and services."
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3", children: [
    isExpanded && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 animate-fade-in", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: makeCall,
          size: "icon",
          className: "h-12 w-12 rounded-full bg-[var(--glass-primary)] backdrop-blur-md border border-[var(--glass-border)] hover:bg-[var(--glass-primary-hover)] shadow-lg hover:scale-110 transition-all group",
          title: "Call Now",
          children: /* @__PURE__ */ jsx(Phone, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: whatsappChat,
          size: "icon",
          className: "h-12 w-12 rounded-full bg-[#25D366] backdrop-blur-md border border-[var(--glass-border)] hover:bg-[#20BA5A] shadow-lg hover:scale-110 transition-all group",
          title: "WhatsApp Chat",
          children: /* @__PURE__ */ jsx(WhatsAppIcon, { className: "h-5 w-5 text-white" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: () => {
            setIsChatOpen(true);
            setIsExpanded(false);
          },
          size: "icon",
          className: "h-12 w-12 rounded-full bg-[var(--glass-primary)] backdrop-blur-md border border-[var(--glass-border)] hover:bg-[var(--glass-primary-hover)] shadow-lg hover:scale-110 transition-all group",
          title: "Chat Assistant",
          children: /* @__PURE__ */ jsx(MessageCircle, { className: "h-5 w-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        onClick: () => setIsExpanded(!isExpanded),
        size: "icon",
        className: "h-16 w-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(255,87,34,0.5)] hover:shadow-[0_0_40px_rgba(255,87,34,0.7)] animate-glow-pulse hover:scale-110 transition-all",
        title: "Quick Actions",
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: `transition-transform duration-300 ${isExpanded ? "rotate-45" : ""}`,
            children: /* @__PURE__ */ jsx(MessageCircle, { className: "h-6 w-6" })
          }
        )
      }
    ),
    /* @__PURE__ */ jsx(Chatbot, { isOpen: isChatOpen, onClose: () => setIsChatOpen(false) })
  ] });
};

const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Viewport,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsx(ToastPrimitives.Root, { ref, className: cn(toastVariants({ variant }), className), ...props });
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Action,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Close,
  {
    ref,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Title, { ref, className: cn("text-sm font-semibold", className), ...props }));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Description, { ref, className: cn("text-sm opacity-90", className), ...props }));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

function Toaster$1() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx(
    Toaster$2,
    {
      theme,
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Prro Health Cllub", "description": "Prro Health Cllub is the best-equipped gym in Kalyan with Being Strong machines, certified trainers, and 15+ years of experience. Join the best fitness center today!" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TooltipProvider", TooltipProvider, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/tooltip", "client:component-export": "TooltipProvider" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "Toaster", Toaster$1, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/toaster", "client:component-export": "Toaster" })} ${renderComponent($$result3, "Sonner", Toaster, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/sonner", "client:component-export": "Toaster" })} ${maybeRenderHead()}<div class="min-h-screen overflow-x-hidden"> ${renderComponent($$result3, "Navigation", Navigation, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/Navigation", "client:component-export": "default" })} <main> ${renderComponent($$result3, "Hero", Hero, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/Hero", "client:component-export": "default" })} ${renderComponent($$result3, "About", About, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/About", "client:component-export": "default" })} ${renderComponent($$result3, "Trainers", Trainers, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/Trainers", "client:component-export": "default" })} ${renderComponent($$result3, "Transformations", Transformations, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/Transformations", "client:component-export": "default" })} ${renderComponent($$result3, "Services", Services, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/Services", "client:component-export": "default" })} ${renderComponent($$result3, "Pricing", Pricing, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/Pricing", "client:component-export": "default" })} ${renderComponent($$result3, "Contact", Contact, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/Contact", "client:component-export": "default" })} </main> ${renderComponent($$result3, "Footer", Footer, {})} ${renderComponent($$result3, "FloatingActionButton", FloatingActionButton, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/FloatingActionButton", "client:component-export": "default" })} </div> ` })} ` })}`;
}, "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/index.astro", void 0);

const $$file = "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
