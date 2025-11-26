"use client";

import WatchlistSyncProvider from "./providers/WatchlistSyncProvider";
import AccessibilityStatus from "./providers/AccessibilityStatus";
import QueryWrapper from "./providers/QueryWrapper";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AccessibilityStatus />
      <WatchlistSyncProvider>
        <QueryWrapper>{children}</QueryWrapper>
      </WatchlistSyncProvider>
    </>
  );
}
