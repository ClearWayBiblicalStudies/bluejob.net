import { Router } from 'express';
import crypto from 'node:crypto';
import { pool } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
const router = Router();
router.post('/checkout', requireAuth, async (req,res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) return res.status(503).json({error:'Stripe is not configured'});
  const { rows: userRows } = await pool.query('SELECT email FROM users WHERE id=$1', [req.user.sub]);
  const customerEmail = userRows[0]?.email;
  const body = new URLSearchParams({mode:'subscription',success_url:process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/membership/success',cancel_url:process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/membership', 'line_items[0][price]':process.env.STRIPE_PRICE_ID,'line_items[0][quantity]':'1','client_reference_id':req.user.sub,...(customerEmail ? {customer_email: customerEmail} : {})});
  const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY, 'Content-Type':'application/x-www-form-urlencoded'},body});
  if(!response.ok) return res.status(502).json({error:'Unable to create checkout session'}); const session=await response.json(); res.json({url:session.url,id:session.id});
});
router.post('/webhook', async (req,res) => {
  const signature=req.headers['stripe-signature']; if(!process.env.STRIPE_WEBHOOK_SECRET || !signature) return res.status(400).send('Invalid webhook');
  const timestamp=signature.split(',').find(x=>x.startsWith('t='))?.slice(2), payload=Buffer.isBuffer(req.rawBody) ? req.rawBody.toString() : JSON.stringify(req.body), expected=crypto.createHmac('sha256',process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${payload}`).digest('hex'), provided=signature.split(',').find(x=>x.startsWith('v1='))?.slice(3);
  if(!timestamp || !provided || provided.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(provided))) return res.status(400).send('Invalid signature');
  const event=req.body;
  if(event.type==='checkout.session.completed' && event.data.object.client_reference_id) {
    const { client_reference_id:userId, customer, subscription }=event.data.object;
    await pool.query(`INSERT INTO memberships(user_id,stripe_customer_id,stripe_subscription_id,status) VALUES($1,$2,$3,'ACTIVE') ON CONFLICT(user_id) DO UPDATE SET status='ACTIVE',stripe_customer_id=EXCLUDED.stripe_customer_id,stripe_subscription_id=EXCLUDED.stripe_subscription_id,updated_at=now()`,[userId,customer,subscription]);
    await pool.query(`UPDATE users SET membership_status='ACTIVE',membership_started_at=COALESCE(membership_started_at,now()) WHERE id=$1`,[userId]);
  }
  if(['customer.subscription.updated','customer.subscription.deleted'].includes(event.type)) {
    const subscription=event.data.object;
    const status=subscription.status==='active'||subscription.status==='trialing' ? (subscription.status==='trialing'?'TRIAL':'ACTIVE') : subscription.status==='past_due'?'PAST_DUE':'CANCELED';
    await pool.query(`UPDATE memberships SET status=$1,updated_at=now() WHERE stripe_subscription_id=$2`,[status,subscription.id]);
    await pool.query(`UPDATE users SET membership_status=$1,membership_expires_at=to_timestamp($2) WHERE stripe_subscription_id=$3 OR stripe_customer_id=$4`,[status,subscription.current_period_end || 0,subscription.id,subscription.customer]);
  }
  res.json({received:true});
});
export default router;
