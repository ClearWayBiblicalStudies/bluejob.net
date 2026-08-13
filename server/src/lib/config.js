export function validateEnvironment() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID', 'STRIPE_WEBHOOK_SECRET', 'EMAIL_PROVIDER_URL', 'SMS_PROVIDER_URL', 'CLIENT_ORIGIN', 'STRIPE_SUCCESS_URL', 'STRIPE_CANCEL_URL'];
  const missing = required.filter((key) => !process.env[key] || /replace[-_]?with|replace_me|example\.com/i.test(process.env[key]));
  if (process.env.NODE_ENV === 'production' && missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  if (process.env.NODE_ENV !== 'production') {
    const devMissing = ['DATABASE_URL', 'JWT_SECRET'].filter((key) => !process.env[key] || process.env[key].includes('replace-with'));
    if (devMissing.length) throw new Error(`Missing required environment variables: ${devMissing.join(', ')}`);
  }
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    throw new Error('STRIPE_SECRET_KEY must be a Stripe secret key');
  }
}
