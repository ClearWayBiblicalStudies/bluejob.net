import { Router } from 'express';
import crypto from 'node:crypto';
import { pool } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
const router = Router();
router.post('/checkout', requireAuth, async (req,res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) return res.status(503).json({error:'Stripe is not configured'});
  const body = new URLSearchParams({mode:'subscription',success_url:process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/membership/success',cancel_url:process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/membership', 'line_items[0][price]':process.env.STRIPE_PRICE_ID,'line_items[0][quantity]':'1','client_reference_id':req.user.sub,'customer_email':req.user.email});
  const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY, 'Content-Type':'application/x-www-form-urlencoded'},body});
  if(!response.ok) return res.status(502).json({error:'Unable to create checkout session'}); const session=await response.json(); res.json({url:session.url,id:session.id});
});
router.post('/webhook', async (req,res) => {
  const signature=req.headers['stripe-signature']; if(!process.env.STRIPE_WEBHOOK_SECRET || !signature) return res.status(400).send('Invalid webhook');
  const timestamp=signature.split(',').find(x=>x.startsWith('t='))?.slice(2), payload=Buffer.isBuffer(req.rawBody) ? req.rawBody.toString() : JSON.stringify(req.body), expected=crypto.createHmac('sha256',process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${payload}`).digest('hex'), provided=signature.split(',').find(x=>x.startsWith('v1='))?.slice(3);
  if(!timestamp || !provided || provided.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(provided))) return res.status(400).send('Invalid signature');
  const event=req.body; if(event.type==='checkout.session.completed' && event.data.object.client_reference_id) await pool.query(`INSERT INTO memberships(user_id,stripe_customer_id,stripe_subscription_id,status) VALUES($1,$2,$3,'ACTIVE') ON CONFLICT(user_id) DO UPDATE SET status='ACTIVE',stripe_subscription_id=EXCLUDED.stripe_subscription_id`,[event.data.object.client_reference_id,event.data.object.customer,event.data.object.subscription]);
  res.json({received:true});
});
export default router;
