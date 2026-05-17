import type { NextFunction, Request, Response } from "express";

// Generic wrapper that preserves the inner handler's Request/Response typing.
// Lets controllers narrow `req.params`, `req.body`, etc. via `Request<P, ResB, ReqB>`.
type AsyncRouteHandler<
  Req extends Request = Request,
  Res extends Response = Response,
> = (req: Req, res: Res, next: NextFunction) => Promise<unknown> | unknown;

export const asyncHandler =
  <Req extends Request = Request, Res extends Response = Response>(
    fn: AsyncRouteHandler<Req, Res>,
  ) =>
  (req: Req, res: Res, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
