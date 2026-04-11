"use client";

import { usePageTitleContext } from "@/contexts/page-title-provider";
import { useLayoutEffect, type ReactNode } from "react";

type Props = { title: ReactNode; actions?: ReactNode };

/**
 * Sets the admin shell header title and optional right-side actions for the current route.
 * Use inside a server page via this client island; updates run in useLayoutEffect to avoid post-paint flicker.
 */
export function SetPageTitle({ title, actions }: Props) {
  const { setTitle } = usePageTitleContext();

  // Sync when props change — no cleanup here, so we never flash null between RSC refreshes.
  useLayoutEffect(() => {
    setTitle(title);

    return () => {
      setTitle(null);
    };
  }, [title, setTitle]);

  // // Clear only on unmount (e.g. route change) so leaving a page resets the shell header.
  // useLayoutEffect(() => {

  // }, [setTitle]);

  return null;
}
