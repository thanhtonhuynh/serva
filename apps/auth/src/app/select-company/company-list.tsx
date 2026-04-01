"use client";

import type { BasicCompany } from "@serva/shared";
import { SIcon } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui/components/button";
import { useTransition } from "react";
import { selectCompanyAction } from "./actions";

type Props = {
  companies: BasicCompany[];
};

export function CompanyList({ companies }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(companyId: string) {
    startTransition(async () => {
      await selectCompanyAction(companyId);
    });
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {companies.map((company) => (
        <Button
          key={company.id}
          variant="outline"
          size="lg"
          className="h-12 justify-start gap-3 px-4 font-semibold tracking-wide"
          disabled={isPending}
          onClick={() => handleSelect(company.id)}
        >
          <SIcon icon="BUILDING" strokeWidth={1.5} className="size-5" />
          {company.name}
        </Button>
      ))}
    </div>
  );
}
