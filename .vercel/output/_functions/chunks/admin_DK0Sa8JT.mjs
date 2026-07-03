import { $ as $$Layout } from './Layout_DJ57xND-.mjs';
import { c as createComponent } from './astro-component_DFzFZJkT.mjs';
import 'piccolore';
import { I as renderTemplate } from './sequence_C_6OXDIK.mjs';
import { r as renderComponent } from './entrypoint_DzPIJZEz.mjs';

const $$Admin = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin ERP Dashboard - Prro Health Club", "description": "Admin management hub for staff, trainer payouts, biometric gateways, and gym parameters." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminDashboardApp", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/admin/AdminDashboardApp", "client:component-export": "default" })} ` })}`;
}, "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/admin.astro", void 0);

const $$file = "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/admin.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
