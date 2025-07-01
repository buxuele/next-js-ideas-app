// 文件路径: tailwind.config.ts
// 这是 Tailwind 的标准配置文件，我们手动创建它

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // 在这里定义你的专属调色板
    extend: {
      colors: {
        'brand-green-dark': '#283618',
        'brand-green-light': '#606C38',
        'brand-cream': '#FEFAE0',
        'brand-orange-light': '#DDA15E',
        'brand-orange-dark': '#BC6C25',
      },
    },
  },
  plugins: [],
}
export default config