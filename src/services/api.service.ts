import axios, { AxiosRequestConfig } from 'axios';

interface IApiService {
  get: <T>(url: string, params?: unknown) => Promise<T>;
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig<unknown>) => Promise<T>;
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig<unknown>) => Promise<T>;
  delete: <T>(url: string, config?: AxiosRequestConfig<unknown>) => Promise<T>;
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig<unknown>) => Promise<T>;
  configure: (config: AxiosRequestConfig<unknown>) => void;
}

export const apiService = ((): IApiService => {
  const baseHeader = {
    baseURL: `${process.env.NEXT_PUBLIC_APP_URL}`,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
  };
  const instance = axios.create({ ...baseHeader });

  // instance.interceptors.request.use(RequestInterceptorResolve, RequestInterceptorReject);
  // instance.interceptors.response.use(ResponseInterceptorFulfilled, ResponseInterceptorRejected);

  const customApiService: IApiService = {
    get: async <T>(url: string, params: unknown): Promise<T> => {
      const response = await instance.get<T>(url, { params });
      return response.data;
    },

    post: async <T>(url: string, data: unknown, config?: AxiosRequestConfig<unknown>): Promise<T> => {
      const response = await instance.post<T>(url, data, config);
      return response.data;
    },

    put: async <T>(url: string, data: unknown, config?: AxiosRequestConfig<unknown>): Promise<T> => {
      const response = await instance.put<T>(url, data, config);
      return response.data;
    },

    delete: async <T>(url: string, config?: AxiosRequestConfig<unknown>): Promise<T> => {
      const response = await instance.delete<T>(url, config);
      return response.data;
    },

    patch: async <T>(url: string, data: unknown, config?: AxiosRequestConfig<unknown>): Promise<T> => {
      const response = await instance.patch<T>(url, data, config);
      return response.data;
    },

    configure: (config?: AxiosRequestConfig<unknown>) => {
      const newInstance = axios.create({ ...baseHeader, ...config });
      return newInstance;
    }
  };

  return customApiService;
})();
