// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 扫描所有组件和页面中的 Class
    "./public/index.html"
  ],
  theme: {
    extend: {
      // 自定义主题（如颜色、字体、间距等）
      colors: {
        'primary': '#3b82f6',
        'secondary': '#e53e3e'
      },
      fontFamily: {
        'sans': ['"Inter"', 'system-ui'],
      }
    },
  },
  plugins: [], // 可选插件（如 @tailwindcss/forms 等）
}