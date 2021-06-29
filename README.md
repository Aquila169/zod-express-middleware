# zod-express-middleware
Middleware for [express](https://www.npmjs.com/package/express) that uses [zod](https://www.npmjs.com/package/zod) to make requests type-safe.

<a href="https://www.npmjs.com/package/zod-express-middleware" rel="nofollow"><img alt="npm" src="https://img.shields.io/npm/v/zod-express-middleware"></a>
<a href="https://www.npmjs.com/package/zod-express-middleware" rel="nofollow"><img alt="npm" src="https://img.shields.io/npm/dw/zod-express-middleware"></a>
<a href="https://github.com/Aquila169/zod-express-middleware/actions/workflows/node.js.yml" rel="nofollow"><img alt="npm" src="https://github.com/Aquila169/zod-express-middleware/actions/workflows/node.js.yml/badge.svg"></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/npm/l/zod-express-middleware" alt="License"></a>

## Installation

This package relies on [zod](https://www.npmjs.com/package/zod), [express](https://www.npmjs.com/package/express) and [@types/express](https://www.npmjs.com/package/@types/express). These have been added as peer dependencies so they can be upgraded independently of this package.

[zod-express-middleware](https://www.npmjs.com/package/zod-express-middleware) can be installed using:

`npm install zod-express-middleware`

## Usage
This package provides the `validateRequest` function, which can be used to validate the `.body`, `.query` and `.params` properties of an Express `Request`. Separate functions for each of these are also provided (`validateRequestBody`, `validateRequestQuery` and `validateRequestParams`). 

**Basic example:**
```typescript
import { validateRequest } from 'zod-express-middleware';
import { z } from 'zod';

// app is an express app
app.get("/", validateRequest({
    body: z.object({
      bodyKey: z.number(),
    }),
  }), (req, res) => {
    // req.body is now strictly-typed and confirms to the zod schema above.
    // req.body has type { bodyKey: number };
    return res.json({message: "Validation for body passed"});  
  }
);
```

A full example of using `validateRequest` in a tiny Express app:

**Full example:**
```typescript
import express from 'express';
import { validateRequest } from 'zod-express-middleware';
import { z } from 'zod';

// Create an express app
const app = express();

// Define an endpoint using express, zod and zod-express-middleware
app.get("/:urlParameter/", validateRequest({
    params: z.object({
      urlParameter: z.string(),
    }),
    body: z.object({
      bodyKey: z.number(),
    }),
    query: z.object({
      queryKey: z.string().length(64),
    }),
  }), (req, res) => {
    // req.params, req.body and req.query are now strictly-typed and confirm to the zod schema's above.
    // req.params has type { urlParameter: string };
    // req.body has type { bodyKey: number };
    // req.query has type { queryKey: string };
    return res.json({message: "Validation for params, body and query passed"});  
  }
);

// Start the express app on port 8080
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running `);
});
```
The `validate*` functions do not modify the query, params or body of the Request object, they only check whether they are valid according to the provided schema's. If you want to use the result of the schema validation (for example, if you want to strip unknown keys), you can use the `process*` equivalents (ie. `processRequest` or `processRequestBody`). These functions also accept a `ZodEffects` object, which means you can use zod's built-in `.transform` method:

**Zod transformation example:**
```typescript
import { processRequest } from 'zod-express-middleware';
import { z } from 'zod';

export const zodEffects = z
  .object({ jsonString: z.string() })
  .refine(
    incomingData => {
      try {
        return JSON.parse(incomingData.jsonString);
      } catch (error) {
        return false;
      }
    },
    {
      message: '.jsonString should be a valid JSON string.',
    },
  )
  .transform(incomingData => {
    return z.object( { bodyKey: z.number() } ).parse(JSON.parse(incomingData.afhandelingsData));
  });

// app is an express app
app.get("/", processRequest({
    body: zodEffects
  }), (req, res) => {
    // req.body is now strictly-typed and confirms to the zod schema above ( in the .transform method ).
    // req.body has type { bodyKey: number };
    return res.json({message: "Validation for body passed"});  
  }
);
```

### validateRequest

This functions accepts an object containing three optional properties:
```typescript
schemas: {
  params? : ZodSchema,
  query? : ZodSchema,
  body? : ZodSchema
}
```
 
Each is a `ZodSchema`, from the zod library. The `validateRequest` function checks whether each of these is present and if so, it will use it validate the corresponding property on the Express `Request` object. 

If validation passes, `next` will be called and your request body, query and params properties will be type-safe within the endpoint. 

If validation fails, a [HTTP 400](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400) response with a list of validation errors will be send to the caller. The `next` function will not be called and the request will stop being processed further.

### validateRequestBody, validateRequestQuery and validateRequestParams

These three functions work exactly the same as `validateRequest`, except they only validate a single property within the Express `Request`.
The other, non-validated properties will have type `any`, as if they were not modified at all. Only an example is provided for `validateRequestBody`, but `validateRequestQuery` and `validateRequestParams` work in the same manner.

**Example:**
```typescript
import { validateRequestBody } from 'zod-express-middleware';
import { z } from 'zod';

// app is an express app
app.get("/", validateRequestBody(
    z.object({
      bodyKey: z.number(),
    })
  ), (req, res) => {
    // req.body is now strictly-typed and confirms to the zod schema above.
    // req.body: { bodyKey: number };
    return res.json({ message: "Validation for body passed" });
  }
);
```
### processRequest

This functions accepts an object containing three optional properties:
```typescript
schemas: {
  params? : ZodSchema,
  query? : ZodSchema,
  body? : ZodSchema
}
```
 
Each is a `ZodSchema` or a `ZodEffects` object, from the zod library. The `processRequest` function checks whether each of these is present and if so, it will use it process the corresponding property on the Express `Request` object. 

If validation passes, `next` will be called and your request body, query and params properties will be type-safe within the endpoint. The body, query and params object will contain the result of the (succesful) parsing by zod. 

If validation fails, a [HTTP 400](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400) response with a list of validation errors will be send to the caller. The `next` function will not be called and the request will stop being processed further.

### processRequestBody, processRequestQuery and processRequestParams

These three functions work exactly the same as `processRequest`, except they only process a single property within the Express `Request`.
The other, non-processed properties will have type `any`, as if they were not modified at all. Only an example is provided for `processRequestBody`, but `processRequestQuery` and `processRequestParams` work in the same manner.

**Example:**
```typescript
import { processRequestBody } from 'zod-express-middleware';
import { z } from 'zod';

// app is an express app
app.get("/", processRequestBody(
    z.object({
      bodyKey: z.number(),
    })
  ), (req, res) => {
    // req.body is now strictly-typed and confirms to the zod schema above.
    // req.body: { bodyKey: number };
    return res.json({ message: "Validation for body passed" });
  }
);
```

### sendError and sendErrors
These two functions can be used to send errors using an Express `Response` to the caller of an endpoint in the same format as the `validateRequest` functions. The function accepts two parameters: an `ErrorListItem` and an Express `Response`. The `ErrorListItem` has type `{ type: 'Body' | 'Query' | 'Params', errors: ZodError }`.

The example below uses `sendError` to emulate the functionality of `validateRequestBody`.
The `sendErrors` function does the same but accepts an array of `ErrorListItem` objects.

**Example:**
```typescript
import { sendError } from 'zod-express-middleware';
import { z } from 'zod';

// app is an express app
app.get("/", (req, res) => {
    const zodSchema = z.object({bodyKey: z.number()});
    const result = zodSchema.safeParse(req.body);
    if(!result.success) {
      return sendError({type: 'Body', errors: result.error}, res);
    }
    return res.json({ message: "Validation passed" });
  }
);
```

### TypedRequest
Besides exporting the above middleware functions, zod-express-middleware also provided several typings for usage with Express requests. Typescript is able to automatically infer the types of your request body, query and params if your endpoint definition is placed in the same file as the validation middleware, as shown above. However, if the code for your endpoint is in a separate file, typings will not be automatically available. This is where the `TypedRequest`, `TypedRequestBody` etc. types come in: the `typeof` a `ZodSchema` can be passed into the `TypedRequest`, providing your function with typings. An example:

```typescript
import { Response } from 'express';
import { TypedRequestBody } from 'zod-express-middleware';

// bodySchema is a ZodSchema, imported from another file.
import { bodySchema } from '../validation/requestSchemas';

// This is the endpoint code: it is not placed in the same file as the route definition and the validation middleware.
export async function endpointCode(req: TypedRequestBody<typeof bodySchema>, res: Response) {
  // req.body is now typed: use TypedRequestParams, TypedRequestQuery for params and query, or TypedRequest for multiple together.
  const typedBody = req.body;
  return res.json(typedBody);
}

```