/** Validatsiya yoki DB xatosidagi bitta maydon. */
export type ErrorDetail = {
  field: string;
  message: string;
};

/** Barcha xatoliklar shu shaklda qaytadi — `GlobalErrorFilter` ga qarang. */
export interface ErrorResponse {
  success: false;
  _message: string;
  errors?: ErrorDetail[];
  /** Kuzatuv identifikatori — foydalanuvchi shuni aytsa, logdan topiladi. */
  requestId?: string;
  stack?: string;
}

/** HTTP status va tanani birga uzatish uchun. */
export type ErrorPayload = {
  status: number;
  body: ErrorResponse;
};
