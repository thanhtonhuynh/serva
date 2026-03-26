import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Fragment } from "react";

export default function ProfileLoading() {
  return (
    <Fragment>
      <Header>
        <h1>Profile</h1>
      </Header>

      <Container>
        <div className="space-y-6">
          {/* Avatar Section Skeleton */}
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-32 w-32 rounded-full" />

            <div className="space-y-2 text-center">
              <Skeleton className="mx-auto h-8 w-40" />
              <Skeleton className="mx-auto h-5 w-28" />
            </div>
          </div>

          <Separator />

          {/* Details Section Skeleton */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Email */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>

            {/* Joined */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <Skeleton className="h-50 w-full" />
            <Skeleton className="h-50 w-full" />
          </div>
        </div>
      </Container>
    </Fragment>
  );
}
