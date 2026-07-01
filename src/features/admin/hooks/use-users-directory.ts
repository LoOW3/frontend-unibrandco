import { useEffect, useState } from 'react';

import { listUsers } from '../../../lib/admin-api-client';
import type { AdminUser } from '../../../types/admin-api';
import { useAuthenticatedFetch } from './use-authenticated-fetch';

type Directory = Map<string, AdminUser>;

// Module-level cache so the directory is fetched once and shared across the
// many ActorBadge instances rendered in tables/details.
let directoryPromise: Promise<Directory> | null = null;

/**
 * Returns a memoized email → user map used to resolve action attribution
 * (avatar + name) from an actor's email.
 */
export function useUsersDirectory(): Directory {
  const { withAuth } = useAuthenticatedFetch();
  const [directory, setDirectory] = useState<Directory>(new Map());

  useEffect(() => {
    let cancelled = false;

    if (!directoryPromise) {
      directoryPromise = withAuth((idToken) => listUsers(idToken))
        .then((response) => new Map(response.users.map((user) => [user.email.toLowerCase(), user])))
        .catch(() => {
          // Reset so a later mount can retry.
          directoryPromise = null;
          return new Map<string, AdminUser>();
        });
    }

    void directoryPromise.then((map) => {
      if (!cancelled) {
        setDirectory(map);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [withAuth]);

  return directory;
}
