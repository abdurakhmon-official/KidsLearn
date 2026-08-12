export type ErrorDetail = {
  field: string;
  message: string;
};

export interface ErrorResponse {
  success: false;
  _message: string;
  errors?: ErrorDetail[];

  requestId?: string;
  stack?: string;
}

export type ErrorPayload = {
  status: number;
  body: ErrorResponse;
};
