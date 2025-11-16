// src/data/categories.ts (EN)
// Purpose: Define the Category shape and the default list
// of categories used by components (e.g., CategoryGrid).
// Consumers treat `icon` as a React component to render.

import type { ComponentType, SVGProps } from "react";
import {
  BookOpenIcon,
  CalendarDaysIcon,
  MicrophoneIcon,
  SparklesIcon,
  SunIcon,
  SwatchIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";

export type CategoryIcon = ComponentType<SVGProps<SVGSVGElement>>;

// Describes a single category entity
export interface Category {
  key: string;
  label: string;
  icon?: CategoryIcon | null;
}

// Primary categories shown when no custom list is provided
export const primaryCategories: Category[] = [
  { key: "Event", label: "Event", icon: CalendarDaysIcon },
  { key: "Season", label: "Season", icon: SunIcon },
  { key: "Theme", label: "Theme", icon: SparklesIcon },
  { key: "Singer", label: "Singer", icon: MicrophoneIcon },
  { key: "Composer", label: "Composer", icon: MusicalNoteIcon },
  { key: "Genre", label: "Genre", icon: SwatchIcon },
  { key: "hasidut", label: "Chasidut", icon: BookOpenIcon },
];
