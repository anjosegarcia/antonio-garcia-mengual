/// <reference types="astro/client" />

declare module "@layouts/*" {
  import type { AstroComponentFactory } from "astro/runtime/server";
  const Component: AstroComponentFactory;
  export default Component;
}

declare module "@data/portfolio" {
  export type Category = {
    id: string;
    title: string;
    image: string;
  };

  export type Work = {
    id: string;
    slug: string;
    category: string;
    title: string;
    images: string[];
    year?: string | number;
    material?: string;
    dimensions?: string;
    description?: string;
  };

  export const categories: Category[];
  export const works: Work[];
}

declare module "@data/*" {
  const data: unknown;
  export default data;
}

declare module "@components/*" {
  import type { AstroComponentFactory } from "astro/runtime/server";
  const Component: AstroComponentFactory;
  export default Component;
}
