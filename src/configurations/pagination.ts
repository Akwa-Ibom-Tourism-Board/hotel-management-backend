import Joi from "joi";
import { Response } from "express";

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

/** Spread into any Joi query-object schema that accepts page/limit. */
export const paginationSchemaFields = {
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_LIMIT).optional(),
};

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page: number;
  /** Omitted (not set) when `optional: true` and the caller sent neither
   *  page nor limit — spreading `...pagination` into a Sequelize query
   *  then leaves `limit`/`offset` unset, i.e. "fetch everything." */
  limit?: number;
  offset?: number;
}

export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
  /**
   * For endpoints that shipped unpaginated and already have callers that
   * never send page/limit — e.g. the owner-facing `/establishments/mine`,
   * whose response shape is a fixed contract with the already-built
   * frontend. When true and neither param was sent, no limit/offset is
   * applied at all (today's "return everything" behavior is preserved);
   * pagination only kicks in once a caller actually asks for it.
   */
  optional?: boolean;
}

/**
 * Turns validated `{ page, limit }` query params into Sequelize-ready
 * `{ page, limit, offset }`. Bounds are re-clamped here (not just at the Joi
 * layer) since this is also called from places that build the params
 * themselves.
 */
export const getPagination = (
  query: PaginationQuery,
  options: PaginationOptions = {},
): PaginationParams => {
  const maxLimit = options.maxLimit ?? MAX_PAGE_LIMIT;
  const defaultLimit = Math.min(
    options.defaultLimit ?? DEFAULT_PAGE_LIMIT,
    maxLimit,
  );

  if (
    options.optional &&
    query.page === undefined &&
    query.limit === undefined
  ) {
    return { page: 1 };
  }

  const page = query.page && query.page > 0 ? Math.floor(query.page) : 1;
  const limit =
    query.limit && query.limit > 0
      ? Math.min(Math.floor(query.limit), maxLimit)
      : defaultLimit;

  return { page, limit, offset: (page - 1) * limit };
};

/**
 * Spreads into a Sequelize `findAll`/`findAndCountAll` options object:
 * `{ ...toSequelizeOptions(pagination) }`. Needed because `exactOptionalPropertyTypes`
 * rejects `limit: undefined` as a literal property — when pagination is in
 * "fetch everything" mode (`limit` genuinely absent), this returns `{}` so
 * the keys are left out entirely rather than present-but-undefined.
 */
export const toSequelizeOptions = (
  pagination: PaginationParams,
): { limit: number; offset: number } | Record<string, never> => {
  if (pagination.limit === undefined || pagination.offset === undefined) {
    return {};
  }
  return { limit: pagination.limit, offset: pagination.offset };
};

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number | null;
  totalPages: number;
}

export const buildPaginationMeta = (
  total: number,
  pagination: PaginationParams,
): PaginationMeta => {
  const limit = pagination.limit ?? null;
  return {
    total,
    page: pagination.page,
    limit,
    totalPages: limit ? Math.max(Math.ceil(total / limit), 1) : 1,
  };
};

/**
 * Exposes pagination metadata via response headers instead of the JSON
 * body — for endpoints whose `data` shape is a fixed contract (a flat
 * array) that pagination metadata can't be folded into without breaking
 * existing callers. Must be called before the body is sent.
 */
export const setPaginationHeaders = (
  response: Response,
  meta: PaginationMeta,
): void => {
  response.setHeader("X-Total-Count", String(meta.total));
  response.setHeader("X-Page", String(meta.page));
  response.setHeader("X-Total-Pages", String(meta.totalPages));
  if (meta.limit !== null) {
    response.setHeader("X-Limit", String(meta.limit));
  }
};
