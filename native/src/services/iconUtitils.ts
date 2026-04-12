import {
  Bed,
  BookOpen,
  Briefcase,
  Building2,
  Cross,
  FlaskConical,
  Library,
  Mic,
  School,
  ShoppingCart,
  Trees,
  Utensils,
  MapPin
} from "lucide-react-native";

export const getIcon = (type: string) => {
  switch (type) {
    case "Lecture Rooms":
      return BookOpen;
    case "Faculty":
      return Building2;
    case "Laboratory":
      return FlaskConical;
    case "Shopping":
      return ShoppingCart;
    case "Administrative":
      return Briefcase;
    case "Library":
      return Library;
    case "Event Centre":
      return Mic;
    case "School":
      return School;
    case "Recreation":
      return Trees;
    case "Food & Dining":
      return Utensils;
    case "Health":
      return Cross;
    case "Hostel":
      return Bed;
    default:
      return MapPin;
  }
};

export const getColor = (type: string) => {
  switch (type) {
    case "Lecture Rooms":
      return "#2563eb"; // blue
    case "Faculty":
      return "#7c3aed"; // purple
    case "Laboratory":
      return "#059669"; // green
    case "Shopping":
      return "#f59e0b"; // orange
    case "Administrative":
      return "#374151"; // gray
    case "Library":
      return "#0ea5e9"; // sky blue
    case "Event Centre":
      return "#ef4444"; // red
    case "School":
      return "#14b8a6"; // teal
    case "Recreation":
      return "#22c55e"; // green
    case "Food & Dining":
      return "#f97316"; // food orange
    case "Health":
      return "#dc2626"; // strong red
    case "Hostel":
      return "#6366f1"; // indigo
    default:
      return "#000";
  }
};
