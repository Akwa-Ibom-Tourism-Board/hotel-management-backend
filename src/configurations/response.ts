import { Response } from "express";
import { PaginationMeta } from "./pagination";

export interface ResponseDetails {
  message: string;
  statusCode: number;
  data?: any;
  /**
   * Pagination metadata for endpoints whose `data` is a fixed flat-array
   * contract (can't fold `{total, page, ...}` into the body without
   * breaking existing callers) — never serialized into the JSON response,
   * controllers pull it out and call `setPaginationHeaders` themselves.
   */
  meta?: PaginationMeta;
}

/**
 * Sends a standardized JSON response to the client: { status, message, data }.
 * Used to send responses from controllers back to the frontend/client.
 */
const responseHandler = (
  response: Response,
  message: string,
  statusCode: number,
  data?: any,
) => {
  return response.status(statusCode).json({
    status: statusCode === 201 || statusCode === 200 ? "success" : "error",
    message,
    data: data ?? null,
  });
};

const handleServicesResponse = (
  statusCode: number,
  message: string,
  data?: any,
  meta?: PaginationMeta,
): ResponseDetails => {
  return { statusCode, message, data, ...(meta !== undefined ? { meta } : {}) };
};

export default {
  responseHandler,
  handleServicesResponse,
};
