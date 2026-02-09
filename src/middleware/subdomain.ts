import { Request, Response, NextFunction } from 'express';
import { siteNotFoundPage } from '../templates/site-not-found';

export function extractSubdomain(req: Request, res: Response, next: NextFunction): void {
  const host = req.headers.host || '';

  const siteMatch = host.match(/^([^.]+)\.sites\./);

  if (!siteMatch) {
    res.status(404).type('html').send(siteNotFoundPage(host));
    return;
  }

  res.locals.hostname = siteMatch[1];
  next();
}
