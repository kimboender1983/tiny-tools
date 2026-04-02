import type { FetchOptions } from 'ofetch';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions extends Omit<FetchOptions, 'method' | 'body' | 'baseURL'> {
  authenticated?: boolean;
}

export function useApi() {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl as string;

  function getAuthHeaders(): Record<string, string> {
    const token = useCookie('auth_token').value;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  async function request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const { authenticated = false, headers: customHeaders, ...rest } = options;

    const headers: Record<string, string> = {
      ...(customHeaders as Record<string, string>),
    };

    if (authenticated) {
      Object.assign(headers, getAuthHeaders());
    }

    try {
      return await $fetch<T>(path, {
        baseURL: apiUrl,
        method,
        body: body !== undefined ? body : undefined,
        headers,
        ...rest,
      });
    } catch (err: unknown) {
      // Auto-logout on 401 for authenticated requests
      if (authenticated && err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 401) {
        const token = useCookie('auth_token');
        if (token.value) {
          token.value = null;
          navigateTo('/admin/login', { replace: true });
        }
      }
      throw err;
    }
  }

  function get<T>(path: string, options?: ApiRequestOptions) {
    return request<T>('GET', path, undefined, options);
  }

  function post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>('POST', path, body, options);
  }

  function put<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>('PUT', path, body, options);
  }

  function patch<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>('PATCH', path, body, options);
  }

  function del<T>(path: string, options?: ApiRequestOptions) {
    return request<T>('DELETE', path, undefined, options);
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    request,
  };
}
