"use client";

import { LoadingButton } from "@serva/serva-ui";
import { useTransition } from "react";
import { getCompanyImpersonationUrl } from "../../actions";

export function OpenCompanyHubButton({ companyId }: { companyId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const url = await getCompanyImpersonationUrl(companyId);
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <LoadingButton
      type="button"
      size="sm"
      loading={pending}
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? "Opening…" : "Open in company hub"}
    </LoadingButton>
  );
}
