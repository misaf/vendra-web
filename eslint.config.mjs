import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    // This is a static export with image optimization disabled. The few plain
    // images are fixed-size local assets and are documented at their call sites.
    rules: {
      '@next/next/no-img-element': 'off'
    }
  },
  {
    // Nextra reads object-literal default exports from its `_meta.tsx` files;
    // config files use the same conventional shape.
    files: ['**/_meta.tsx', '*.config.mjs'],
    rules: {
      'import/no-anonymous-default-export': 'off'
    }
  },
  globalIgnores(['.next/**', 'out/**', 'public/_pagefind/**', 'next-env.d.ts'])
])
