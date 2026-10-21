// react-router.config.ts
import type { Config } from "@react-router/dev/config";

const basename = import.meta.env.VITE_BASENAME || '/';

export default {
  ssr: false,
  // basename: basename,
} satisfies Config;