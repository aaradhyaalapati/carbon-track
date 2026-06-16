/** @type {import('postcss').ProcessOptions & {plugins: Record<string, object>}} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
