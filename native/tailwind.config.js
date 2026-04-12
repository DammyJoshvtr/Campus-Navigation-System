/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#2563EB",
        tertiary: "#10B981",
      },
      fontFamily: {
        "home-bold": ["PlusJakartaSans_700Bold"],
        "home-semibold": ["PlusJakartaSans_600SemiBold"],
        "home-medium": ["PlusJakartaSans_500Medium"],
        "home-regular": ["PlusJakartaSans_400Regular"],
      },
    },
  },
  plugins: [],
};
