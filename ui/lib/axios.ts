import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { clearSession, getToken } from "@/lib/session";
import { translateServerMessage } from "@/lib/server-messages";
import type { ApiError } from "@/types/api";

/**
 * Yagona HTTP mijoz. RTK Query ham shu instansdan o'tadi
 * (`store/api/base-query.ts` dagi `axiosBaseQuery`), shuning uchun token
 * biriktirish, toast va 401 mantig'i faqat shu yerda yashaydi.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

/** Bu sahifalarda 401 normal holat — qaytarib yuborish loop hosil qiladi. */
const PUBLIC_PATHS = ["/login", "/register"];

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const message = response.data?._message;

    if (message) {
      toast.success(translateServerMessage(message));
    }

    return response;
  },
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const message = error.response?.data?._message ?? error.message;

    if (status === 401) {
      clearSession();

      const onPublicPage = PUBLIC_PATHS.some((path) => window.location.pathname.startsWith(path));

      if (!onPublicPage) {
        toast.error(translateServerMessage(message));

        // Ataylab to'liq qayta yuklash: bu fayl komponent emas, `useRouter`
        // mavjud emas. Bundan tashqari sessiya tugaganda butun Redux/RTK Query
        // cache'i tozalanishi kerak — `router.push` uni saqlab qolardi.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";

        return Promise.reject(error);
      }
    }

    // Validatsiya xatolari maydon ostida ko'rsatiladi (`errors[]` →
    // `setError`), shuning uchun umumiy toast ham chiqsa takror bo'lardi.
    const hasFieldErrors = Boolean(error.response?.data?.errors?.length);

    if (!hasFieldErrors) {
      toast.error(translateServerMessage(message));
    }

    return Promise.reject(error);
  },
);

export default api;
