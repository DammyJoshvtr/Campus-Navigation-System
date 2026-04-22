// ============ PERSONAL NOTES ==============
//1️⃣ Sans-serif fonts (Best for maps & UI)

// Clean, modern, easy to read

// Works well on mobile screens

// Examples:

// Font Use Case
// Roboto Default for Android, very readable, professional
// Inter Modern, good for headings and body text
// Poppins Rounded, friendly feel, good for buttons
// Open Sans Neutral, works well for body text

// ==============================================

// =============TouchableOpacityProps==================
// Because of extends TouchableOpacityProps, you can use

// onPress, disabled, activeOpacity etc.

// This allows a parent component to get the reference of the button.

// Example:
// const buttonRef = useRef(null);
// <GeneralButton ref={buttonRef} />
// Then the parent can do things like:
// focus, measure position, animate
// ==========================================================

//🧠 What you actually need

// For proper navigation, you need:

// 📍 User location (start)
// 📍 Selected location (destination)
// 🧭 Route between them


//Next Step...

// Set up OpenRouteService in your exact code
// Replace your handleGetDirections cleanly
// Show animated route drawing
// Add distance + ETA (like Uber)
// Make it feel like real Google Maps navigation
