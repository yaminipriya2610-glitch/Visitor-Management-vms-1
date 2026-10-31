import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ShieldCheck, LogOut, Plus, RefreshCw, Check, X, Download, QrCode, ClipboardCheck, Users, Clock, AlertCircle } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import './index.css'
import { api } from './api'

const initialForm = { visitor_name:'', visitor_contact:'', id_proof_type:'Aadhaar', id_proof_number:'', purpose:'', visit_date:'', start_time:'09:00', end_time:'10:00' }

function App(){
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('vms_user')||'null'))
  const [page,setPage]=useState('dashboard')
  const [auth,setAuth]=useState(user?'login':'login')
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const [demo,setDemo]=useState(false)
  const logout=()=>{localStorage.removeItem('vms_token');localStorage.removeItem('vms_user');setUser(null);setPage('dashboard')}
  const showError=(e)=>{setError(e.message||'Something went wrong');setMessage('');setTimeout(()=>setError(''),4500)}
  if(!user) return <Auth onLogin={(u)=>{setUser(u);setPage('dashboard')}} showError={showError} demo={demo} setDemo={setDemo}/>
  return <Layout user={user} page={page} setPage={setPage} logout={logout} message={message} setMessage={setMessage} error={error} showError={showError}/>
}

function Auth({onLogin,showError,demo,setDemo}){
  const [mode,setMode]=useState('login');
  const [form,setForm]=useState({name:'',email:'employee@example.com',password:'employee123'})
  const submit=async(e)=>{e.preventDefault();try{if(mode==='register'){await api.register({...form,role:'EMPLOYEE'});setMode('login');return} const data=await api.login({email:form.email,password:form.password});localStorage.setItem('vms_token',data.access_token);localStorage.setItem('vms_user',JSON.stringify(data.user));onLogin(data.user)}catch(err){showError(err)}}
  const seed=async()=>{try{await api.seedDemo();setDemo(true)}catch(err){showError(err)}}
  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4"><div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">
    <div className="p-10 md:p-14 bg-gradient-to-br from-indigo-700 to-slate-900 text-white"><ShieldCheck size={44}/><h1 className="text-4xl font-bold mt-8">VisitorPass</h1><p className="text-indigo-100 mt-4 leading-7">A secure digital visitor approval workflow for employees and security teams.</p><div className="mt-10 space-y-4 text-sm text-indigo-100"><p>✓ Employee visitor registration</p><p>✓ Security approval / rejection</p><p>✓ Automatic QR generation</p><p>✓ Gate verification</p></div></div>
    <div className="p-8 md:p-12"><div className="flex gap-2 mb-8"><button onClick={()=>setMode('login')} className={`flex-1 py-2 rounded-lg ${mode==='login'?'bg-slate-900 text-white':'bg-slate-100'}`}>Login</button><button onClick={()=>setMode('register')} className={`flex-1 py-2 rounded-lg ${mode==='register'?'bg-slate-900 text-white':'bg-slate-100'}`}>Register</button></div>
      {mode==='register' && <><label className="text-sm">Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><p className="text-xs text-slate-500">New accounts are registered as Employees. Use the local demo Security Head account for approval testing.</p></>}
      <label className="text-sm">Email</label><input className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><label className="text-sm">Password</label><input type="password" className="input" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
      <button onClick={submit} className="w-full mt-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">{mode==='login'?'Sign in':'Create account'}</button>
      <button onClick={seed} className="w-full mt-3 py-2 text-sm text-slate-600 border rounded-xl">Create demo accounts</button>{demo&&<p className="text-xs text-emerald-600 mt-2">Demo accounts are ready. Employee: employee@example.com / employee123</p>}
    </div></div></div>
}

function Layout({user,page,setPage,logout,message,setMessage,error,showError}){
 return <div className="min-h-screen bg-slate-50"><header className="bg-white border-b sticky top-0 z-10"><div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl"><ShieldCheck/></div><div><div className="font-bold">VisitorPass</div><div className="text-xs text-slate-500">Online Visitor Management</div></div></div><div className="flex items-center gap-4"><div className="hidden sm:block text-right"><div className="font-medium text-sm">{user.name}</div><div className="text-xs text-slate-500">{user.role.replace('_',' ')}</div></div><button onClick={logout} className="p-2 rounded-lg hover:bg-slate-100"><LogOut size={18}/></button></div></div></header>
 <main className="max-w-7xl mx-auto p-5 md:p-8">{message&&<div className="mb-5 p-3 rounded-xl bg-emerald-50 text-emerald-700">{message}</div>}{error&&<div className="mb-5 p-3 rounded-xl bg-red-50 text-red-700">{error}</div>}{user.role==='EMPLOYEE'?<EmployeeDashboard setPage={setPage} page={page} setMessage={setMessage} showError={showError}/>:<SecurityDashboard setPage={setPage} page={page} setMessage={setMessage} showError={showError}/>}</main></div>
}

function EmployeeDashboard({page,setPage,setMessage,showError}){
 const [bookings,setBookings]=useState([]); const [loading,setLoading]=useState(true); const [form,setForm]=useState(initialForm)
 const load=async()=>{try{setLoading(true);setBookings(await api.myBookings())}catch(e){showError(e)}finally{setLoading(false)}}
 useEffect(()=>{load()},[])
 const submit=async(e)=>{e.preventDefault();try{await api.createBooking(form);setForm(initialForm);setMessage('Visitor request submitted to Security Head.');setPage('dashboard');load()}catch(err){showError(err)}}
 if(page==='new') return <div><PageTitle title="Register Visitor" subtitle="Submit a visitor request for security approval."/><form onSubmit={submit} className="bg-white rounded-2xl border p-6 grid md:grid-cols-2 gap-5"><Field label="Visitor name" value={form.visitor_name} onChange={v=>setForm({...form,visitor_name:v})}/><Field label="Contact number" value={form.visitor_contact} onChange={v=>setForm({...form,visitor_contact:v})}/><Field label="ID proof type" value={form.id_proof_type} onChange={v=>setForm({...form,id_proof_type:v})}/><Field label="ID proof number" value={form.id_proof_number} onChange={v=>setForm({...form,id_proof_number:v})}/><Field label="Purpose" value={form.purpose} onChange={v=>setForm({...form,purpose:v})}/><Field label="Visit date" type="date" value={form.visit_date} onChange={v=>setForm({...form,visit_date:v})}/><Field label="Start time" type="time" value={form.start_time} onChange={v=>setForm({...form,start_time:v})}/><Field label="End time" type="time" value={form.end_time} onChange={v=>setForm({...form,end_time:v})}/><div className="md:col-span-2 flex gap-3"><button type="submit" className="btn-primary"><Plus size={18}/>Submit request</button><button type="button" className="btn-secondary" onClick={()=>setPage('dashboard')}>Cancel</button></div></form></div>
 return <><PageTitle title="Employee Dashboard" subtitle="Create visitor requests and track approval status." action={<button className="btn-primary" onClick={()=>setPage('new')}><Plus size={18}/>Register visitor</button>}/><div className="grid sm:grid-cols-3 gap-4 mb-7"><Stat title="Total requests" value={bookings.length} icon={<ClipboardCheck/>}/><Stat title="Pending" value={bookings.filter(x=>x.status==='PENDING').length} icon={<Clock/>}/><Stat title="Approved" value={bookings.filter(x=>x.status==='APPROVED').length} icon={<Check/>}/></div><div className="bg-white rounded-2xl border overflow-hidden"><div className="p-5 border-b flex justify-between"><h2 className="font-semibold">My visitor requests</h2><button onClick={load} className="p-2 hover:bg-slate-100 rounded-lg"><RefreshCw size={17}/></button></div>{loading?<div className="p-8 text-center">Loading…</div>:bookings.length===0?<Empty text="No visitor requests yet."/>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="th">Visitor</th><th className="th">Date</th><th className="th">Purpose</th><th className="th">Status</th><th className="th">Action</th></tr></thead><tbody>{bookings.map(b=><tr key={b.id} className="border-t"><td className="td font-medium">{b.visitor_name}<div className="text-xs text-slate-400">{b.booking_code}</div></td><td className="td">{b.visit_date}<div className="text-xs text-slate-400">{b.start_time}–{b.end_time}</div></td><td className="td max-w-xs">{b.purpose}</td><td className="td"><Status status={b.status}/>{b.rejection_reason&&<div className="text-xs text-red-600 mt-1">{b.rejection_reason}</div>}</td><td className="td">{b.status==='APPROVED'?<button className="btn-secondary text-xs" onClick={()=>api.downloadQr(b.id).catch(showError)}><Download size={15}/>Download QR</button>:<span className="text-slate-400">—</span>}</td></tr>)}</tbody></table></div>}</div></>
}

function SecurityDashboard({page,setPage,setMessage,showError}){
 const [bookings,setBookings]=useState([]); const [filter,setFilter]=useState('PENDING'); const [verifyToken,setVerifyToken]=useState(''); const [verifyResult,setVerifyResult]=useState(null)
 const load=async()=>{try{setBookings(await api.securityBookings(filter))}catch(e){showError(e)}}
 useEffect(()=>{load()},[filter])
 const approve=async(id)=>{try{await api.approve(id);setMessage('Booking approved and QR generated.');load()}catch(e){showError(e)}}
 const reject=async(id)=>{const reason=window.prompt('Enter rejection reason:');if(!reason?.trim())return;try{await api.reject(id,reason);setMessage('Booking rejected.');load()}catch(e){showError(e)}}
 if(page==='verify') return <VerifyGate verifyToken={verifyToken} setVerifyToken={setVerifyToken} verifyResult={verifyResult} setVerifyResult={setVerifyResult} showError={showError}/>
 return <><PageTitle title="Security Head Dashboard" subtitle="Review visitor requests and control gate access." action={<button className="btn-primary" onClick={()=>setPage('verify')}><QrCode size={18}/>Gate verification</button>}/><div className="grid sm:grid-cols-3 gap-4 mb-7"><Stat title="Pending review" value={bookings.length} icon={<AlertCircle/>}/><Stat title="Current filter" value={filter} icon={<Users/>}/><Stat title="Security role" value="Active" icon={<ShieldCheck/>}/></div><div className="bg-white rounded-2xl border overflow-hidden"><div className="p-5 border-b flex flex-wrap gap-2 items-center justify-between"><h2 className="font-semibold">Visitor requests</h2><div className="flex gap-2">{['PENDING','APPROVED','REJECTED'].map(s=><button key={s} onClick={()=>setFilter(s)} className={`px-3 py-2 text-xs rounded-lg ${filter===s?'bg-slate-900 text-white':'bg-slate-100'}`}>{s}</button>)}<button onClick={load} className="p-2 rounded-lg hover:bg-slate-100"><RefreshCw size={17}/></button></div></div>{bookings.length===0?<Empty text={`No ${filter.toLowerCase()} requests.`}/>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="th">Visitor</th><th className="th">Employee</th><th className="th">Visit</th><th className="th">Purpose</th><th className="th">Action</th></tr></thead><tbody>{bookings.map(b=><tr key={b.id} className="border-t"><td className="td font-medium">{b.visitor_name}<div className="text-xs text-slate-400">{b.booking_code}</div></td><td className="td">{b.employee_name}</td><td className="td">{b.visit_date}<div className="text-xs text-slate-400">{b.start_time}–{b.end_time}</div></td><td className="td">{b.purpose}</td><td className="td">{b.status==='PENDING'?<div className="flex gap-2"><button onClick={()=>approve(b.id)} className="btn-approve"><Check size={15}/>Approve</button><button onClick={()=>reject(b.id)} className="btn-reject"><X size={15}/>Reject</button></div>:<Status status={b.status}/>}</td></tr>)}</tbody></table></div>}</div></>
}


function VerifyGate({verifyToken,setVerifyToken,verifyResult,setVerifyResult,showError}){
 const [scanning,setScanning]=useState(false)
 useEffect(()=>{
   if(!scanning) return
   const scanner=new Html5Qrcode('qr-reader')
   let active=true
   scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:250,height:250}},async(decoded)=>{
     if(!active) return
     setVerifyToken(decoded); setScanning(false)
     try{setVerifyResult(await api.verify(decoded))}catch(e){showError(e)}
   }).catch(()=>{setScanning(false);showError(new Error('Camera could not start. Allow camera permission or use paste verification.'))})
   return ()=>{active=false;scanner.stop().catch(()=>{})}
 },[scanning])
 return <><PageTitle title="Gate Verification" subtitle="Scan a visitor QR code or paste its token before entry."/><div className="grid lg:grid-cols-2 gap-5 max-w-5xl"><div className="bg-white border rounded-2xl p-6"><div className="flex gap-2 mb-4"><button className="btn-primary" onClick={()=>setScanning(true)} disabled={scanning}><QrCode size={18}/>{scanning?'Scanning…':'Scan with camera'}</button>{scanning&&<button className="btn-secondary" onClick={()=>setScanning(false)}>Stop</button>}</div><div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl"></div><label className="text-sm">QR token / scanned payload</label><textarea className="input min-h-28" value={verifyToken} onChange={e=>setVerifyToken(e.target.value)} placeholder="VISITOR:booking-code:token"/><button className="btn-primary" onClick={async()=>{try{setVerifyResult(await api.verify(verifyToken))}catch(e){showError(e)}}}><ClipboardCheck size={18}/>Verify token</button></div>{verifyResult&&<div className={`bg-white border rounded-2xl p-6 h-fit ${verifyResult.valid?'ring-2 ring-emerald-200':'ring-2 ring-red-200'}`}><div className={`text-lg font-bold ${verifyResult.valid?'text-emerald-700':'text-red-700'}`}>{verifyResult.message}</div>{verifyResult.booking&&<div className="mt-5 space-y-2 text-sm"><p><b>Visitor:</b> {verifyResult.booking.visitor_name}</p><p><b>Booking:</b> {verifyResult.booking.booking_code}</p><p><b>Contact:</b> {verifyResult.booking.visitor_contact}</p><p><b>Purpose:</b> {verifyResult.booking.purpose}</p><p><b>Visit:</b> {verifyResult.booking.visit_date}, {verifyResult.booking.start_time}–{verifyResult.booking.end_time}</p></div>}</div>}</div></>
}

function PageTitle({title,subtitle,action}){return <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7"><div><h1 className="text-2xl font-bold">{title}</h1><p className="text-slate-500 mt-1 text-sm">{subtitle}</p></div>{action}</div>}
function Field({label,value,onChange,type='text'}){return <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span><input required type={type} className="input" value={value} onChange={e=>onChange(e.target.value)}/></label>}
function Status({status}){const cls={PENDING:'bg-amber-50 text-amber-700',APPROVED:'bg-emerald-50 text-emerald-700',REJECTED:'bg-red-50 text-red-700'}[status];return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{status}</span>}
function Stat({title,value,icon}){return <div className="bg-white border rounded-2xl p-5 flex items-center justify-between"><div><p className="text-xs uppercase tracking-wide text-slate-500">{title}</p><p className="text-2xl font-bold mt-2">{value}</p></div><div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">{icon}</div></div>}
function Empty({text}){return <div className="p-10 text-center text-slate-500">{text}</div>}

const style=document.createElement('style');style.textContent=`.input{display:block;width:100%;margin-top:.4rem;margin-bottom:1rem;border:1px solid #cbd5e1;border-radius:.75rem;padding:.7rem .85rem;outline:none;background:white}.input:focus{border-color:#6366f1;box-shadow:0 0 0 3px #e0e7ff}.btn-primary{display:inline-flex;align-items:center;gap:.45rem;background:#4f46e5;color:white;padding:.65rem 1rem;border-radius:.75rem;font-weight:600}.btn-secondary{display:inline-flex;align-items:center;gap:.45rem;background:white;color:#334155;border:1px solid #cbd5e1;padding:.6rem .9rem;border-radius:.75rem}.btn-approve{display:inline-flex;align-items:center;gap:.3rem;background:#059669;color:white;padding:.45rem .7rem;border-radius:.6rem;font-size:.75rem}.btn-reject{display:inline-flex;align-items:center;gap:.3rem;background:#dc2626;color:white;padding:.45rem .7rem;border-radius:.6rem;font-size:.75rem}.th{text-align:left;padding:.8rem 1rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:#64748b}.td{padding:.9rem 1rem;vertical-align:top}`;document.head.appendChild(style)

createRoot(document.getElementById('root')).render(<App/>)
