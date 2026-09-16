import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "parameter-layout",
      transformIndexHtml() {
        return [
          {
            tag: "link",
            attrs: { rel: "stylesheet", href: "/react/parameter-layout.css" },
            injectTo: "head",
          },
        ];
      },
    },
  ],
});
