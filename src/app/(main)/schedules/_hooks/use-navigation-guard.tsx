"use client";

import { ConfirmDialog } from "@/components/shared";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type UseNavigationGuardReturn = {
  confirmDialog: React.ReactNode;
  guardedNavigate: (href: string) => void;
};

/**
 * Intercepts all navigation attempts when `isDirty` is true and shows a
 * confirmation dialog before allowing the user to leave.
 *
 * Covers:
 * - Tab close / page reload (`beforeunload`)
 * - In-app `<a>` link clicks (sidebar, prev/next week, etc.) via document click capture
 * - Browser back/forward (`popstate` with sentinel history state)
 * - Programmatic navigation via the returned `guardedNavigate` helper
 */
export function useNavigationGuard(isDirty: boolean): UseNavigationGuardReturn {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // --- beforeunload (tab close / reload) ---
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirtyRef.current) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // --- popstate (browser back/forward) ---
  useEffect(() => {
    // Push a sentinel state so we can detect back-button presses
    history.pushState({ __guard: true }, "");

    function handlePopState(e: PopStateEvent) {
      if (!isDirtyRef.current) return;

      // Re-push sentinel to stay on the page, then show dialog
      history.pushState({ __guard: true }, "");
      setPendingHref("__back__");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // --- Document click capture (all <a> links) ---
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!isDirtyRef.current) return;

      // Ignore modified clicks (open in new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links and anchor-only links
      if (href.startsWith("http") || href.startsWith("#")) return;

      // Ignore links to the exact same URL
      if (href === window.location.pathname + window.location.search) return;

      e.preventDefault();
      e.stopPropagation();
      setPendingHref(href);
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  // --- Programmatic navigation guard ---
  const guardedNavigate = useCallback(
    (href: string) => {
      if (isDirtyRef.current) {
        setPendingHref(href);
      } else {
        router.push(href);
      }
    },
    [router],
  );

  // --- Dialog callbacks ---
  const handleConfirm = useCallback(() => {
    const href = pendingHref;
    setPendingHref(null);

    if (href === "__back__") {
      // Remove sentinel and go back
      history.go(-2);
    } else if (href) {
      router.push(href);
    }
  }, [pendingHref, router]);

  const handleCancel = useCallback(() => {
    setPendingHref(null);
  }, []);

  const confirmDialog = (
    <ConfirmDialog open={pendingHref !== null} onConfirm={handleConfirm} onCancel={handleCancel} />
  );

  return { confirmDialog, guardedNavigate };
}
