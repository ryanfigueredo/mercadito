"use client";

import { useState, useEffect } from "react";
import { DatabaseError, withRetry } from "./db-error-handler";

export function useDatabase<T>(
  operation: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DatabaseError | null>(null);
  const [retrying, setRetrying] = useState(false);

  const executeOperation = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await withRetry(operation, 3, 1000);
      setData(result);
    } catch (err) {
      setError(err as DatabaseError);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    executeOperation();
  }, dependencies);

  const retry = () => executeOperation(true);

  return { data, loading, error, retry, retrying };
}
