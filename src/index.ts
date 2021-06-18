import { RequestHandler, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ZodEffects, ZodError, ZodSchema } from 'zod';

type NonReadOnly<T> = { -readonly [P in keyof T]: NonReadOnly<T[P]> };

export function stripReadOnly<T>(readOnlyItem: T): NonReadOnly<T> {
  return readOnlyItem as NonReadOnly<T>;
}

type ErrorListItem = { type: 'Query' | 'Params' | 'Body'; errors: ZodError<any> };

export const sendErrors: (errors: Array<ErrorListItem>, res: Response) => void = (errors, res) => {
  return res.status(400).send(errors.map((error) => ({ type: error.type, errors: error.errors })));
};
export const sendError: (error: ErrorListItem, res: Response) => void = (error, res) => {
  return res.status(400).send({ type: error.type, errors: error.errors });
};

export function processRequestBody<TBody>(effects: ZodSchema<TBody>): RequestHandler<ParamsDictionary, any, TBody, any>;
export function processRequestBody<TBody>(
  effects: ZodEffects<any, TBody>,
): RequestHandler<ParamsDictionary, any, TBody, any>;
export function processRequestBody<TBody>(
  effectsSchema: ZodEffects<any, TBody> | ZodSchema<TBody>,
): RequestHandler<ParamsDictionary, any, TBody, any> {
  return (req, res, next) => {
    const parsed = effectsSchema.safeParse(req.body);
    if (parsed.success) {
      req.body = parsed.data;
      return next();
    } else {
      return sendErrors([{ type: 'Body', errors: parsed.error }], res);
    }
  };
}

export function processRequestParams<TParams>(effects: ZodSchema<TParams>): RequestHandler<TParams, any, any, any>;
export function processRequestParams<TParams>(
  effects: ZodEffects<any, TParams>,
): RequestHandler<TParams, any, any, any>;
export function processRequestParams<TParams>(
  effectsSchema: ZodEffects<any, TParams> | ZodSchema<TParams>,
): RequestHandler<TParams, any, any, any> {
  return (req, res, next) => {
    const parsed = effectsSchema.safeParse(req.params);
    if (parsed.success) {
      req.params = parsed.data;
      return next();
    } else {
      return sendErrors([{ type: 'Params', errors: parsed.error }], res);
    }
  };
}

export function processRequestQuery<TQuery>(
  effects: ZodSchema<TQuery>,
): RequestHandler<ParamsDictionary, any, any, TQuery>;
export function processRequestQuery<TQuery>(
  effects: ZodEffects<any, TQuery>,
): RequestHandler<ParamsDictionary, any, any, TQuery>;
export function processRequestQuery<TQuery>(
  effectsSchema: ZodEffects<any, TQuery> | ZodSchema<TQuery>,
): RequestHandler<ParamsDictionary, any, any, TQuery> {
  return (req, res, next) => {
    const parsed = effectsSchema.safeParse(req.query);
    if (parsed.success) {
      req.query = parsed.data;
      return next();
    } else {
      return sendErrors([{ type: 'Query', errors: parsed.error }], res);
    }
  };
}

export function processRequest<TParams = any, TQuery = any, TBody = any>(
  schemas: Partial<{
    params: ZodEffects<any, TParams>;
    query: ZodEffects<any, TQuery>;
    body: ZodEffects<any, TBody>;
  }>,
): RequestHandler<TParams, any, TBody, TQuery>;
export function processRequest<TParams = any, TQuery = any, TBody = any>(
  schemas: Partial<{
    params: ZodSchema<TParams>;
    query: ZodSchema<TQuery>;
    body: ZodSchema<TBody>;
  }>,
): RequestHandler<TParams, any, TBody, TQuery>;
export function processRequest<TParams = any, TQuery = any, TBody = any>(
  schemas:
    | Partial<{
        params: ZodSchema<TParams>;
        query: ZodSchema<TQuery>;
        body: ZodSchema<TBody>;
      }>
    | Partial<{
        params: ZodEffects<any, TParams>;
        query: ZodEffects<any, TQuery>;
        body: ZodEffects<any, TBody>;
      }>,
): RequestHandler<TParams, any, TBody, TQuery> {
  return (req, res, next) => {
    const errors: Array<ErrorListItem> = [];
    if (schemas.params) {
      const parsed = schemas.params.safeParse(req.params);
      if (parsed.success) {
        req.params = parsed.data;
      } else {
        errors.push({ type: 'Params', errors: parsed.error });
      }
    }
    if (schemas.query) {
      const parsed = schemas.query.safeParse(req.query);
      if (parsed.success) {
        req.query = parsed.data;
      } else {
        errors.push({ type: 'Query', errors: parsed.error });
      }
    }
    if (schemas.body) {
      const parsed = schemas.body.safeParse(req.body);
      if (parsed.success) {
        req.body = parsed.data;
      } else {
        errors.push({ type: 'Body', errors: parsed.error });
      }
    }
    if (errors.length > 0) {
      return sendErrors(errors, res);
    }
    return next();
  };
}

export const validateRequestBody: <TBody>(
  zodSchema: ZodSchema<TBody>,
) => RequestHandler<ParamsDictionary, any, TBody, any> = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (parsed.success) {
    return next();
  } else {
    return sendErrors([{ type: 'Body', errors: parsed.error }], res);
  }
};

export const validateRequestParams: <TParams>(zodSchema: ZodSchema<TParams>) => RequestHandler<TParams, any, any, any> =
  (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.params);
    if (parsed.success) {
      return next();
    } else {
      return sendErrors([{ type: 'Params', errors: parsed.error }], res);
    }
  };

export const validateRequestQuery: <TQuery>(
  zodSchema: ZodSchema<TQuery>,
) => RequestHandler<ParamsDictionary, any, any, TQuery> = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.query);
  if (parsed.success) {
    return next();
  } else {
    return sendErrors([{ type: 'Query', errors: parsed.error }], res);
  }
};

export const validateRequest: <TParams = any, TQuery = any, TBody = any>(
  schemas: Partial<{
    params: ZodSchema<TParams>;
    query: ZodSchema<TQuery>;
    body: ZodSchema<TBody>;
  }>,
) => RequestHandler<TParams, any, TBody, TQuery> =
  ({ params, query, body }) =>
  (req, res, next) => {
    const errors: Array<ErrorListItem> = [];
    if (params) {
      const parsed = params.safeParse(req.params);
      if (!parsed.success) {
        errors.push({ type: 'Params', errors: parsed.error });
      }
    }
    if (query) {
      const parsed = query.safeParse(req.query);
      if (!parsed.success) {
        errors.push({ type: 'Query', errors: parsed.error });
      }
    }
    if (body) {
      const parsed = body.safeParse(req.body);
      if (!parsed.success) {
        errors.push({ type: 'Body', errors: parsed.error });
      }
    }
    if (errors.length > 0) {
      return sendErrors(errors, res);
    }
    return next();
  };
