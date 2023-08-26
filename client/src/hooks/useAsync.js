import { useCallback, useEffect, useState } from "react";

/**
 *
 * This just runs all the asynchronous codes!!
 * ...state = { loading, error, value }
 */

// runs the execute function automatically and returns the state
export function useAsync(fn, deps = []) {
  const { execute, ...state } = useAsyncInternal(fn, deps, true);

  useEffect(() => {
    execute();
  }, [execute]);

  return state;
}

// this returns {execute, ...state}
// this allows you run the execute function when u want not automatically
export function useAsyncFn(fn, deps = []) {
  return useAsyncInternal(fn, deps);
}

function useAsyncInternal(fn, deps, initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState("");
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
