# zod-express-middleware
Middleware for [express](https://www.npmjs.com/package/express) that uses [zod](https://www.npmjs.com/package/zod) to make requests type-safe.

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
### validateRequest

This functions accepts an object containing three optional properties:
```typescript
schemas: {
  params? : ZodSchema
  query? : ZodSchema
  body? : ZodSchema
}
```
 
Each is a `ZodSchema`, from the zod library. The `validateRequest` function checks whether each of these is present and if so, it will use it validate the corresponding property on the Express `Request` object. 

If validation passes, `next` will be called and your request body, query and params properties will be type-safe within the endpoint. 

If validation fails, a [HTTP 400](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400) response with a list of validation errors will be send to the caller. The `next` function will not be called and the request will stop being processed further.

This is the main function. It receives an object with the Zod schemas for what you want to validate,
together with the middleware you want to guard. If validation passes, your middleware will be called
with type-safe `req` properties. If validation fails, `next` will be called containg and instance of
`ZodError`

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