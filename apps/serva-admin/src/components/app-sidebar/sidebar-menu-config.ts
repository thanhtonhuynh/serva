import { ROUTES } from "@/lib/routes";
import type { IconSvgElement } from "@hugeicons/react";
import { ICONS } from "@serva/serva-ui";

export type MenuItem = {
  title: string;
  url: string;
  icon: IconSvgElement;
};

export const MENU_ITEMS: MenuItem[] = [
  { title: "Companies", url: ROUTES.companies, icon: ICONS.BUILDING },
  { title: "Identities", url: ROUTES.identities, icon: ICONS.USER_GROUP },
];
