import Link from "next/link";
import { createPost } from "./actions";

export default function CreatePage() {
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/" className="text-button">Back home <span>←</span></Link></div><section className="create-card"><span className="eyebrow">A CAMPUS MOMENT</span><h1>What would you like to share?</h1><p>Keep it human, useful, and comfortable for the people who share your campus.</p><form action={createPost} className="post-form"><textarea name="body" required maxLength={2200} placeholder="A thought, a question, a little joy..." /><label>Audience<select name="audience" defaultValue="campus"><option value="campus">My campus</option><option value="followers">Followers</option><option value="public">All verified students</option></select></label><button className="primary-button">Publish post <span>→</span></button></form><p className="form-footnote">Posts are subject to visibility settings, community standards, and reporting controls.</p></section></main>;
}
