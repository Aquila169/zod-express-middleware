import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ZodError, ZodSchema } from 'zod';

type ErrorList = { type: 'Query' | 'Params' | 'Body'; errors: ZodError<any> };

function sendErrors(res: any, errors: Array<ErrorList>) {
  return res.status(400).send(errors.map((error) => error.errors.flatten().fieldErrors));
}

export const validateRequestBody: <TBody>(
  zodSchema: ZodSchema<TBody>,
) => RequestHandler<ParamsDictionary, any, TBody, any> = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (parsed.success) {
    return next();
  } else {
    return sendErrors(res, [{ type: 'Body', errors: parsed.error }]);
  }
};

export const validateRequestParams: <TParams>(zodSchema: ZodSchema<TParams>) => RequestHandler<TParams, any, any, any> =
  (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.params);
    if (parsed.success) {
      return next();
    } else {
      return sendErrors(res, [{ type: 'Params', errors: parsed.error }]);
    }
  };

export const validateRequestQuery: <TQuery>(
  zodSchema: ZodSchema<TQuery>,
) => RequestHandler<ParamsDictionary, any, any, TQuery> = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.query);
  if (parsed.success) {
    return next();
  } else {
    return sendErrors(res, [{ type: 'Query', errors: parsed.error }]);
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
    const errors: Array<ErrorList> = [];
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
      return sendErrors(res, errors);
    }
    return next();
  };
