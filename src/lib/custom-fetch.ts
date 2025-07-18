import { Result } from '@praha/byethrow';

export type WrappedResult<T> = Result.ResultAsync<T, Error>;

// NOTE: Supports cases where `content-type` is other than `json`
const getBody = <T>(c: Response | Request): Promise<T> => {
  const contentType = c.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return c.json();
  }

  if (contentType?.includes('application/pdf')) {
    return c.blob() as Promise<T>;
  }

  return c.text() as Promise<T>;
};

// NOTE: Update just base url
const getUrl = (contextUrl: string): string => {
  const url = new URL(contextUrl);
  const pathname = url.pathname;
  const search = url.search;
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'productionBaseUrl'
      : 'http://localhost:3000';

  const requestUrl = new URL(`${baseUrl}${pathname}${search}`);

  return requestUrl.toString();
};

// NOTE: Add headers
const getHeaders = (headers?: HeadersInit): HeadersInit => {
  return {
    ...headers,
    Authorization: 'token',
    'Content-Type': 'multipart/form-data',
  };
};

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Result.ResultAsync<T, Error> =>
  Result.try({
    try: async () => {
      const requestUrl = getUrl(url);
      const requestHeaders = getHeaders(options.headers);

      const requestInit: RequestInit = {
        ...options,
        headers: requestHeaders,
      };

      const response = await fetch(requestUrl, requestInit);
      const data = await getBody<T>(response);

      return { status: response.status, data, headers: response.headers } as T;
    },
    catch: (error) => {
      if (error instanceof Error) {
        return error;
      }
      return new Error('An unknown error occurred during fetch');
    },
  })();

export type ErrorType<Error> = Error;
