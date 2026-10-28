import React from "react";

export async function api(path, options = {}) {
  const response = await fetch(`/api/v1${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && !path.startsWith("/auth/"))
    window.dispatchEvent(new CustomEvent("atmoswatch:session-expired"));
  if (!response.ok) {
    const error = new Error(body.error?.message || "The request could not be completed.");
    error.status = response.status;
    error.code = body.error?.code;
    throw error;
  }
  return body;
}

export function useRequest(loader, dependencies = []) {
  const [state, setState] = React.useState({ data: null, loading: true, error: "" });
  React.useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: "" }));
    loader()
      .then((data) => active && setState({ data, loading: false, error: "" }))
      .catch((error) => active && setState({ data: null, loading: false, error: error.message }));
    return () => {
      active = false;
    };
  }, dependencies);
  const refresh = React.useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const data = await loader();
      setState({ data, loading: false, error: "" });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error.message });
    }
  }, dependencies);
  return { ...state, refresh };
}
