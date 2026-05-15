import twilio from 'twilio';
import { Request, Response, NextFunction } from 'express';

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

export function verifyTwilioSignature(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'development' || !TWILIO_AUTH_TOKEN) {
    // Skip verification in dev or if token missing (though critical in prod)
    return next();
  }

  const signature = req.header('X-Twilio-Signature');
  if (!signature) {
    console.error('[Security] Missing Twilio signature');
    return res.status(403).send('Forbidden: No signature');
  }

  // Determine full URL. AI Studio environment might need header inspection
  const protocol = req.header('x-forwarded-proto') || req.protocol;
  const host = req.header('host');
  const path = req.originalUrl;
  const url = `${protocol}://${host}${path}`;

  const valid = twilio.validateRequest(
    TWILIO_AUTH_TOKEN,
    signature,
    url,
    req.body
  );

  if (valid) {
    next();
  } else {
    console.warn('[Security] Invalid Twilio Signature detected at', url);
    res.status(403).send('Forbidden: Invalid signature');
  }
}
