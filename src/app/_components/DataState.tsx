import Link from "next/link";

export function DataState({ title, body, action }: { title: string; body: string; action?: { label: string; href: string } }) {
  return <section className="module-empty"><span className="module-empty-mark">✦</span><h2>{title}</h2><p>{body}</p>{action && <Link className="primary-button" href={action.href}>{action.label}<span>→</span></Link>}</section>;
}

export function ModuleHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="module-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{body}</p></header>;
}
