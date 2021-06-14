import { validateRequest, validateRequestBody, validateRequestParams, validateRequestQuery } from './index';
import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';

let nextFunction: NextFunction = jest.fn();

function mockRequest({
  body,
  query,
  params,
}: {
  body?: Record<string, any>;
  query?: Record<string, any>;
  params?: Record<string, any>;
}): Partial<Request> {
  return {
    body,
    query,
    params,
  };
}
let sendMock = jest.fn();
function mockResponse(): Partial<Response> {
  return {
    status: jest.fn(() => ({ send: sendMock } as any)),
  };
}

describe('Request body validator', () => {
  beforeEach(() => {
    sendMock.mockClear();
  });
  const bodySchema = z.object({ RequestBodyKey: z.string() });
  it('Should call next() on succcesful validation', () => {
    validateRequestBody(bodySchema)(
      mockRequest({ body: { RequestBodyKey: 'dit is de value' } }) as Request,
      mockResponse() as Response,
      nextFunction,
    );
    expect(nextFunction).toHaveBeenCalled();
  });
  it('Should send a HTTP400 on failed validation', () => {
    const mockedResponse = mockResponse();
    validateRequestBody(z.object({ RequestBodyKey: z.string() }))(
      mockRequest({ body: { RequestBodyKey: 12345 } }) as Request,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a meaningful error on failed validation', () => {
    const mockedResponse = mockResponse();
    validateRequestBody(z.object({ RequestBodyKey: z.string() }))(
      mockRequest({ body: { RequestBodyKey: 12345 } }) as Request,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Body', errors: expect.anything() }]);
  });
});
describe('Request query validator', () => {
  beforeEach(() => {
    sendMock.mockClear();
  });
  const querySchema = z.object({ RequestQueryKey: z.string() });
  it('Should call next() on succcesful validation', () => {
    validateRequestQuery(querySchema)(
      mockRequest({ query: { RequestQueryKey: 'dit is de value' } }) as any,
      mockResponse() as Response,
      nextFunction,
    );
    expect(nextFunction).toHaveBeenCalled();
  });
  it('Should send a HTTP400 on failed validation', () => {
    const mockedResponse = mockResponse();
    validateRequestQuery(z.object({ RequestQueryKey: z.string() }))(
      mockRequest({ query: { RequestQueryKey: 12345 } }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a meaningful error on failed validation', () => {
    const mockedResponse = mockResponse();
    validateRequestQuery(z.object({ RequestQueryKey: z.string() }))(
      mockRequest({ query: { RequestQueryKey: 12345 } }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Query', errors: expect.anything() }]);
  });
});
describe('Request params validator', () => {
  beforeEach(() => {
    sendMock.mockClear();
  });
  const paramsSchema = z.object({ RequestParamsKey: z.string() });
  it('Should call next() on succcesful validation', () => {
    validateRequestParams(paramsSchema)(
      mockRequest({ params: { RequestParamsKey: 'dit is de value' } }) as any,
      mockResponse() as Response,
      nextFunction,
    );
    expect(nextFunction).toHaveBeenCalled();
  });
  it('Should send a HTTP400 on failed validation', () => {
    const mockedResponse = mockResponse();
    validateRequestParams(z.object({ RequestParamsKey: z.string() }))(
      mockRequest({ params: { RequestParamsKey: 12345 } }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a meaningful error on failed validation', () => {
    const mockedResponse = mockResponse();
    validateRequestParams(z.object({ RequestParamsKey: z.string() }))(
      mockRequest({ params: { RequestParamsKey: 12345 } }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Params', errors: expect.anything() }]);
  });
});
describe('Request validator', () => {
  beforeEach(() => {
    sendMock.mockClear();
  });
  const paramsSchema = z.object({ RequestParamsKey: z.string() });
  const bodySchema = z.object({ RequestBodyKey: z.string() });
  const querySchema = z.object({ RequestQueryKey: z.string() });
  it('Should call next() on succcesful validation', () => {
    validateRequest({ body: bodySchema, params: paramsSchema, query: querySchema })(
      mockRequest({
        params: { RequestParamsKey: 'dit is de value' },
        body: { RequestBodyKey: 'dit is de value' },
        query: { RequestQueryKey: 'dit is de value' },
      }) as any,
      mockResponse() as Response,
      nextFunction,
    );
    expect(nextFunction).toHaveBeenCalled();
  });
  it('Should send a HTTP400 on failed validation of params', () => {
    const mockedResponse = mockResponse();
    validateRequest({ body: bodySchema, params: paramsSchema, query: querySchema })(
      mockRequest({
        params: { RequestParamsKey: 1234 },
        body: { RequestBodyKey: 'dit is de value' },
        query: { RequestQueryKey: 'dit is de value' },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a HTTP400 on failed validation of body', () => {
    const mockedResponse = mockResponse();
    validateRequest({ body: bodySchema, params: paramsSchema, query: querySchema })(
      mockRequest({
        params: { RequestParamsKey: 'dit is de value' },
        body: { RequestBodyKey: 1234 },
        query: { RequestQueryKey: 'dit is de value' },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a HTTP400 on failed validation of query', () => {
    const mockedResponse = mockResponse();
    validateRequest({ body: bodySchema, params: paramsSchema, query: querySchema })(
      mockRequest({
        params: { RequestParamsKey: 'dit is de value' },
        body: { RequestBodyKey: 'dit is de value' },
        query: { RequestQueryKey: 1234 },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a meaningful error on failed validation of params', () => {
    const mockedResponse = mockResponse();
    validateRequest({ body: bodySchema, params: paramsSchema, query: querySchema })(
      mockRequest({
        params: { RequestParamsKey: 1234 },
        body: { RequestBodyKey: 'dit is de value' },
        query: { RequestQueryKey: 'dit is de value' },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Params', errors: expect.anything() }]);
  });
  it('Should send a meaningful error on failed validation of body', () => {
    const mockedResponse = mockResponse();
    validateRequest({ body: bodySchema, params: paramsSchema, query: querySchema })(
      mockRequest({
        params: { RequestParamsKey: 'dit is de value' },
        body: { RequestBodyKey: 1234 },
        query: { RequestQueryKey: 'dit is de value' },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Body', errors: expect.anything() }]);
  });
  it('Should send a meaningful error on failed validation of query', () => {
    const mockedResponse = mockResponse();
    validateRequest({ body: bodySchema, params: paramsSchema, query: querySchema })(
      mockRequest({
        params: { RequestParamsKey: 'dit is de value' },
        body: { RequestBodyKey: 'dit is de value' },
        query: { RequestQueryKey: 1234 },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Query', errors: expect.anything() }]);
  });
});
