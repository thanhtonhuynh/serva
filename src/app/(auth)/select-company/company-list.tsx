"use client";

import { Button } from "@/components/ui/button";
import type { BasicCompany } from "@/types/company";
import { Building2 } from "lucide-react";
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
    <div className="flex flex-col gap-2">
      {companies.map((company) => (
        <Button
          key={company.id}
          variant="outline"
          className="h-auto justify-start gap-3 p-4"
          disabled={isPending}
          onClick={() => handleSelect(company.id)}
        >
          <Building2 className="text-muted-foreground size-5" />
          <div className="text-left">
            <p className="font-medium">{company.name}</p>
            <p className="text-muted-foreground text-xs">{company.slug}</p>
          </div>
        </Button>
      ))}
    </div>
  );
}
