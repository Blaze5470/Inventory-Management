import { useState } from 'react'
import { Boxes, LockKeyhole, Mail, ArrowRight, LoaderCircle } from 'lucide-react'

export default function Auth({ supabase, notify }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      notify('Enter a valid email address.', 'error')
      return
    }
    if (password.length < 8) {
      notify('Password must be at least 8 characters.', 'error')
      return
    }
    setBusy(true)
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (result.error) throw result.error
      if (mode === 'signup' && !result.data.session) {
        notify('Account created. Check your email to confirm your address.', 'success')
      } else {
        notify('You are signed in.', 'success')
      }
    } catch (error) {
      notify(error.message || 'Authentication failed.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark large"><Boxes size={27} /></div>
        <p className="eyebrow">STOCKROOM INVENTORY</p>
        <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted auth-copy">
          {mode === 'signin' ? 'Sign in to manage your inventory.' : 'Create a secure account to get started.'}
        </p>
        <form onSubmit={submit} className="auth-form">
          <label>Email address</label>
          <div className="input-icon"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
          <label>Password</label>
          <div className="input-icon"><LockKeyhole size={17} /><input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required /></div>
          <button className="button primary full" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <>{mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></>}</button>
        </form>
        <p className="auth-switch">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          <button className="text-button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>{mode === 'signin' ? 'Create one' : 'Sign in'}</button>
        </p>
        <p className="auth-foot">Your inventory is private to your account.</p>
      </section>
    </main>
  )
}