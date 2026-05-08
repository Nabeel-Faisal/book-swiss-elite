import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../utils/db.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors]     = useState({});
  const [authErr, setAuthErr]   = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('se_auth') || '{}');
      if (auth.loggedIn) navigate('/admin/dashboard', { replace: true });
    } catch(e) {}
  }, [navigate]);

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!email)    errs.email    = 'Email is required.';
    if (!password) errs.password = 'Password is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setAuthErr(''); setLoading(true);

    loginAdmin(email, password).then(admin => {
      if (admin) {
        const session = { loggedIn:true, email, name: admin.name, role: admin.role, token:'se_'+Date.now() };
        localStorage.setItem('se_auth', JSON.stringify(session));
        if (remember) localStorage.setItem('se_remember', '1');
        navigate('/admin/dashboard', { replace: true });
      } else {
        setAuthErr('Invalid email or password.');
        setLoading(false);
      }
    }).catch(() => {
      setAuthErr('Connection error. Please try again.');
      setLoading(false);
    });
  }

  return (
    <div style={{fontFamily:"'Poppins',sans-serif",background:'#000',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--gold:#C8A45D;--gold-light:#D9B870;--gold-dim:rgba(200,164,93,0.12);--gold-border:rgba(200,164,93,0.3);--bg:#000;--bg-card:#0d0d0d;--bg-input:#111;--text:#f0ede6;--text-muted:#5a5750;--text-sec:#9e9b93;--border:rgba(255,255,255,0.06);--red:#e05353}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .login-wrap{width:100%;max-width:420px;animation:fadeUp .5s ease forwards}
        .brand{text-align:center;margin-bottom:2.5rem}
        .brand-logo{font-size:1.5rem;font-weight:700;letter-spacing:.22em;color:var(--text)}
        .brand-logo span{color:var(--gold)}
        .brand-sub{font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:var(--text-muted);margin-top:.3rem}
        .card{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:2.5rem;position:relative;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6)}
        .card::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,var(--gold-border),transparent)}
        .card-title{font-size:1.4rem;font-weight:600;margin-bottom:.3rem;color:var(--text)}
        .card-sub{font-size:.8rem;color:var(--text-muted);margin-bottom:2rem}
        .field{margin-bottom:1.25rem}
        .label{font-size:.7rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--text-sec);display:block;margin-bottom:.5rem}
        .input-wrap{position:relative}
        .input{width:100%;padding:.85rem 1.1rem;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;color:var(--text);font-family:'Poppins',sans-serif;font-size:.88rem;outline:none;transition:.25s ease}
        .input::placeholder{color:var(--text-muted)}
        .input:focus{border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-dim)}
        .input.error{border-color:var(--red);box-shadow:0 0 0 3px rgba(224,83,83,.1)}
        .eye-btn{position:absolute;right:.9rem;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);cursor:pointer;padding:.2rem;font-size:1rem}
        .row{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:.5rem}
        .remember{display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.8rem;color:var(--text-sec);user-select:none}
        .remember input{accent-color:var(--gold);width:15px;height:15px;cursor:pointer}
        .forgot{font-size:.8rem;color:var(--gold);text-decoration:none}
        .btn{width:100%;padding:.95rem;background:linear-gradient(135deg,var(--gold),var(--gold-light));color:#000;font-family:'Poppins',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:none;border-radius:10px;cursor:pointer;transition:.25s ease}
        .btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(200,164,93,.4)}
        .btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .err-msg{font-size:.77rem;color:var(--red);margin-top:.4rem;min-height:1.1em}
        .spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(0,0,0,.3);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:.4rem}
        .hint{background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:10px;padding:.85rem 1rem;margin-top:1.5rem;font-size:.75rem;color:var(--text-sec);line-height:1.6}
        .hint strong{color:var(--gold)}
      `}</style>
      <div className="login-wrap">
        <div className="brand">
          <div className="brand-logo">◆ SWISS <span>ELITE</span></div>
          <div className="brand-sub">Admin Dashboard</div>
        </div>
        <div className="card">
          <h1 className="card-title">Welcome back</h1>
          <p className="card-sub">Sign in to manage your chauffeur fleet</p>
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label className="label">Email Address</label>
              <input className={`input ${errors.email ? 'error' : ''}`} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@swisselite.com" autoComplete="email"/>
              <p className="err-msg">{errors.email}</p>
            </div>
            <div className="field">
              <label className="label">Password</label>
              <div className="input-wrap">
                <input className={`input ${errors.password ? 'error' : ''}`} type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{paddingRight:'3rem'}} autoComplete="current-password"/>
                <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)}>{showPw ? '🙈' : '👁'}</button>
              </div>
              <p className="err-msg">{errors.password}</p>
            </div>
            <div className="row">
              <label className="remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/> Remember me</label>
              <a href="#" className="forgot">Forgot password?</a>
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? <><span className="spinner"/>Signing in...</> : 'Sign In'}
            </button>
            <p className="err-msg" style={{textAlign:'center',marginTop:'.75rem'}}>{authErr}</p>
          </form>
          <div className="hint">
            Use your admin email and password to sign in.
          </div>
        </div>
      </div>
    </div>
  );
}
