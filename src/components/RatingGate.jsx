export default function RatingGate({ job, onStartRating }) {
  if (!job) return null;
  return <section className="bj-gate"><p className="bj-eyebrow">ONE THING BEFORE YOUR NEXT JOB</p><h2>Keep BlueJob trustworthy.</h2><p>Rate your completed work for <strong>{job.title}</strong>. Marketplace access unlocks after you submit it.</p><button className="button button-primary" onClick={() => onStartRating(job.id)}>Complete Work Score Rating</button></section>;
}
