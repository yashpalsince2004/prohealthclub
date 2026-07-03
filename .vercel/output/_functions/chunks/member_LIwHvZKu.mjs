import { $ as $$Layout } from './Layout_DJ57xND-.mjs';
import { c as createComponent } from './astro-component_DFzFZJkT.mjs';
import 'piccolore';
import { I as renderTemplate } from './sequence_C_6OXDIK.mjs';
import { r as renderComponent } from './entrypoint_DzPIJZEz.mjs';

const $$Member = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Member Card - Prro Health Club", "description": "Track your workouts, diet plans, memberships, and attendances." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MemberDashboardApp", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/member/MemberDashboardApp", "client:component-export": "default" })} ` })}`;
}, "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/member.astro", void 0);

const $$file = "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/member.astro";
const $$url = "/member";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Member,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
