"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const DataRevisionContext = createContext(null);

const INITIAL = {
  tasks: 0,
  sleep: 0,
  savings: 0,
  reminders: 0,
  profile: 0,
  notifications: 0,
};

export function DataRevisionProvider({ children }) {
  const [revisions, setRevisions] = useState(INITIAL);

  const bump = useCallback((key) => {
    setRevisions((current) => ({
      ...current,
      [key]: (current[key] || 0) + 1,
    }));
  }, []);

  const bumpMany = useCallback((keys) => {
    setRevisions((current) => {
      const next = { ...current };
      keys.forEach((key) => {
        next[key] = (next[key] || 0) + 1;
      });
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ revisions, bump, bumpMany }),
    [revisions, bump, bumpMany]
  );

  return (
    <DataRevisionContext.Provider value={value}>
      {children}
    </DataRevisionContext.Provider>
  );
}

export function useDataRevision() {
  const context = useContext(DataRevisionContext);
  if (!context) {
    throw new Error("useDataRevision harus digunakan di dalam DataRevisionProvider.");
  }
  return context;
}