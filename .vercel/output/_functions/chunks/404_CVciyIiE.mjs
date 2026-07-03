import { $ as $$Layout } from './Layout_DJ57xND-.mjs';
import { c as createComponent } from './astro-component_DFzFZJkT.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead } from './sequence_C_6OXDIK.mjs';
import { r as renderComponent } from './entrypoint_DzPIJZEz.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "404 - Page Not Found", "description": "Oops! Page not found" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex min-h-screen items-center justify-center bg-gray-100"> <div class="text-center"> <h1 class="mb-4 text-4xl font-bold text-gray-900">404</h1> <p class="mb-4 text-xl text-gray-600">Oops! Page not found</p> <a href="/" class="text-blue-500 underline hover:text-blue-700 font-semibold">
Return to Home
</a> </div> </div> ` })}`;
}, "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/404.astro", void 0);

const $$file = "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
