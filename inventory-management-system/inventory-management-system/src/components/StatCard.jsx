import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function StatCard({ label, value, note, icon: Icon, tone = 'blue' }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={20} /></div>
      <div className="stat-content">
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{note}</span>
      </div>
    </article>
  )
}