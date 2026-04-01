"use client";

import { Callout, LoadingButton } from "@serva/serva-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/serva-ui/components/card";
import { FieldGroup, FieldLabel } from "@serva/serva-ui/components/field";
import { Input } from "@serva/serva-ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@serva/serva-ui/components/select";
import { useState, useTransition } from "react";
import { updateIdentityAction, type UpdateIdentityInput } from "./actions";

type Props = {
  identityId: string;
  defaultValues: UpdateIdentityInput;
};

const ACCOUNT_STATUSES = ["active", "inactive", "suspended"] as const;

export function IdentityForm({ identityId, defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState(defaultValues.name);
  const [email, setEmail] = useState(defaultValues.email);
  const [accountStatus, setAccountStatus] = useState(defaultValues.accountStatus);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const data: UpdateIdentityInput = { name, email, accountStatus };
      const result = await updateIdentityAction(identityId, data);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      }
    });
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Edit Identity</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <Callout variant="error" message={error} />}
          {success && <Callout variant="success" message="Changes saved." />}

          <FieldGroup>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="accountStatus">Account Status</FieldLabel>
            <Select
              value={accountStatus}
              onValueChange={(v) => setAccountStatus(v as UpdateIdentityInput["accountStatus"])}
            >
              <SelectTrigger id="accountStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          <LoadingButton type="submit" loading={isPending}>
            Save Changes
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  );
}
