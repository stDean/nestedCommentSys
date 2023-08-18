import { useCallback, useEffect, useState } from "react";

export function useAsync(fn, deps = []) {
  const { execute, ...state } = useAsyncInternal(fn, deps, true);

  useEffect(() => {
    execute();
  }, [execute]);

  return state;
}

// this returns a function
export function useAsyncFn(fn, deps = []) {
  return useAsyncInternal(fn, deps);
}

function useAsyncInternal(fn, deps, initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState();
  const [value, setValue] = useState([]);

  const execute = useCallback((...params) => {
    setLoading(true);
    return fn(...params)
      .then((data) => {
        setError(null);
        setValue(data);
        return data;
      })
      .catch((e) => {
        setValue(undefined);
        setError(e);
        return Promise.reject(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, deps);

  return { loading, error, value, execute };
}
