import { c as createComponent } from './astro-component_DFzFZJkT.mjs';
import 'piccolore';
import { _ as addAttribute, bk as renderHead, bl as renderSlot, I as renderTemplate } from './sequence_C_6OXDIK.mjs';
import 'clsx';

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description = "Prro Health Cllub is the best-equipped gym in Kalyan with Being Strong machines, certified trainers, and 15+ years of experience. Join the best fitness center today!" } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><meta name="description"${addAttribute(description, "content")}><meta name="author" content="Prro Health Cllub"><meta name="keywords" content="gym Kalyan, fitness center, personal training, CrossFit, weight loss, muscle gain, certified trainers, Prro Health Cllub"><meta property="og:type" content="website"><meta property="og:image" content="https://storage.googleapis.com/gpt-engineer-file-uploads/jKk1v1Lqf5ZMWAq6mOzufRs8gef2/social-images/social-1762234752072-330825510_1273521926561446_3441611663722265655_n.jpg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@prohealthclub"><meta name="twitter:image" content="https://storage.googleapis.com/gpt-engineer-file-uploads/jKk1v1Lqf5ZMWAq6mOzufRs8gef2/social-images/social-1762234752072-330825510_1273521926561446_3441611663722265655_n.jpg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet"><meta property="og:title"${addAttribute(title, "content")}><meta name="twitter:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><link rel="icon" type="image/x-icon" href="https://storage.googleapis.com/gpt-engineer-file-uploads/jKk1v1Lqf5ZMWAq6mOzufRs8gef2/uploads/1762234733655-330825510_1273521926561446_3441611663722265655_n.jpg">${renderHead()}</head> <body class="bg-background text-foreground font-sans"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
