const $=s=>document.querySelector(s),app=$('#app'),KEY='cqm_quizzes',DK='cqm_draft';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}};
const save=a=>localStorage.setItem(KEY,JSON.stringify(a));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3);
const enc=q=>btoa(unescape(encodeURIComponent(JSON.stringify({id:q.id,t:q.title,d:q.desc,c:q.creator,q:q.questions.map(x=>[x.q,x.o,x.a])}))));
const dec=s=>{const o=JSON.parse(decodeURIComponent(escape(atob(s))));
  if(!o.id||!o.t||o.q.length!==10||o.q.some(x=>!x[0]||x[1].length!==4||!(x[2]>=0&&x[2]<4)))throw 0;
  return{id:String(o.id),title:o.t,desc:o.d||'',creator:o.c||'?',plays:0,questions:o.q.map(x=>({q:x[0],o:x[1],a:x[2]}))}};
const link=q=>location.href.split('#')[0]+'#q='+enc(q);
const MASCOT=`<svg class="mascot" viewBox="0 0 100 90"><circle cx="24" cy="26" r="13" fill="#fff"/><circle cx="76" cy="26" r="13" fill="#fff"/><circle cx="24" cy="26" r="6" fill="#ffc2dc"/><circle cx="76" cy="26" r="6" fill="#ffc2dc"/><ellipse cx="50" cy="55" rx="40" ry="32" fill="#fff"/><circle cx="35" cy="52" r="4.5" fill="#5a4a6e"/><circle cx="65" cy="52" r="4.5" fill="#5a4a6e"/><circle cx="36.5" cy="50.5" r="1.5" fill="#fff"/><circle cx="66.5" cy="50.5" r="1.5" fill="#fff"/><ellipse cx="25" cy="63" rx="7" ry="4" fill="#ffb3d1"/><ellipse cx="75" cy="63" rx="7" ry="4" fill="#ffb3d1"/><path d="M44 62q3 5 6 0q3 5 6 0" fill="none" stroke="#5a4a6e" stroke-width="2.5" stroke-linecap="round"/></svg>`;

let toastT;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200)}
async function copy(txt){try{await navigator.clipboard.writeText(txt)}catch{const a=document.createElement('textarea');a.value=txt;document.body.append(a);a.select();document.execCommand('copy');a.remove()}}

/* sparkles background */
$('#bg').innerHTML=Array.from({length:20},()=>`<span style="left:${Math.random()*100}%;top:${Math.random()*100}%;font-size:${12+Math.random()*18}px;animation-delay:${Math.random()*4}s">${'✦♡★☁✧'[Math.floor(Math.random()*5)]}</span>`).join('');

/* draft */
const newDraft=()=>({title:'',desc:'',creator:'',step:0,questions:Array.from({length:10},()=>({q:'',o:['','','',''],a:-1}))});
let D;try{D=JSON.parse(localStorage.getItem(DK))||newDraft();if(D.questions.length!==10)D=newDraft()}catch{D=newDraft()}
const saveD=()=>localStorage.setItem(DK,JSON.stringify(D));
const isDone=q=>q.q.trim()&&q.o.every(o=>o.trim())&&q.a>=0;
let G,R;

const list=(arr,mine)=>arr.length?arr.map(q=>`<div class="card qi"><div><h3>${esc(q.title)}</h3><p>👤 ${esc(q.creator)} · ❓ 10 soal · ▶ ${q.plays||0}x dimainkan</p>${q.desc?`<small>${esc(q.desc)}</small>`:''}</div><div class="acts"><button class="btn sm" data-act="play" data-id="${q.id}">▶ Main</button>${mine?`<button class="btn sm blue" data-act="share" data-id="${q.id}">🔗 Share</button><button class="btn sm ghost" data-act="del" data-id="${q.id}" aria-label="Hapus">🗑</button>`:''}</div></div>`).join('')
:`<div class="card empty center">${MASCOT}<p>Belum ada kuis di sini ☁️</p><a class="btn" href="#create">Buat kuis</a></div>`;

const views={
home(){app.innerHTML=`<div class="hero">${MASCOT}<h1>Bikin kuis lucu, yuk! ✨</h1><p>Buat 10 soal, bagikan link, lihat siapa yang paling jago 🎀</p></div>
<div class="home"><a class="card c1" href="#create"><i>📝</i><h3>Create Quiz</h3><p>Bikin kuis 10 soal</p></a>
<a class="card c2" href="#take"><i>🎮</i><h3>Take Quiz</h3><p>Main kuis teman</p></a>
<a class="card c3" href="#mine"><i>📚</i><h3>My Quizzes</h3><p>${load().length} kuis tersimpan</p></a></div>`},

create(){const s=D.step,n=D.questions.filter(isDone).length;
  const dots=`<div class="dots"><button class="dot ${s==0?'cur':''}" data-act="goto" data-n="0" aria-label="Info kuis">📝</button>${D.questions.map((q,i)=>`<button class="dot ${isDone(q)?'done':''} ${s==i+1?'cur':''}" data-act="goto" data-n="${i+1}">${i+1}</button>`).join('')}</div>`;
  let body;
  if(s==0)body=`<h2>Info kuis 🌷</h2><label>Judul</label><input data-f="title" maxlength="60" placeholder="Contoh: Seberapa kenal aku?" value="${esc(D.title)}"><label>Deskripsi</label><textarea data-f="desc" maxlength="150" placeholder="Ceritakan sedikit tentang kuis ini">${esc(D.desc)}</textarea><label>Nama pembuat</label><input data-f="creator" maxlength="30" placeholder="Namamu" value="${esc(D.creator)}"><div class="acts"><button class="btn" data-act="next">Lanjut ke soal 1 ➜</button></div>`;
  else{const q=D.questions[s-1];
    body=`<div class="top"><h2>Soal ${s}</h2><span class="pill">${s}/10</span></div><div class="bar"><i style="width:${s*10}%"></i></div>
    <label>Pertanyaan</label><textarea data-q="1" maxlength="200" placeholder="Tulis pertanyaanmu…">${esc(q.q)}</textarea>
    <label>Pilihan jawaban <span class="hint">· tap ⭐ untuk jawaban benar</span></label>
    ${q.o.map((o,k)=>`<div class="orow"><button class="tick ${q.a==k?'on':''}" data-act="correct" data-k="${k}" aria-label="Jawaban benar ${'ABCD'[k]}">${q.a==k?'⭐':'ABCD'[k]}</button><input data-o="${k}" maxlength="100" placeholder="Opsi ${'ABCD'[k]}" value="${esc(o)}"></div>`).join('')}
    <div class="acts"><button class="btn ghost" data-act="back">⬅ Kembali</button>${s<10?`<button class="btn" data-act="next">Lanjut ➜</button>`:`<button class="btn lav" data-act="publish">🎉 Publish</button>`}</div>`}
  app.innerHTML=`<div class="card">${body}</div><p class="hint center">Terisi ${n}/10 soal · kuis baru bisa dipublish kalau 10 soal lengkap</p>${dots}`},

take(){app.innerHTML=`<div class="card"><h2>Main kuis 🎮</h2><label>Punya link kuis dari teman?</label><input id="code" placeholder="Tempel link kuis di sini"><div class="acts"><button class="btn blue" data-act="code">Buka kuis ✨</button></div></div><h3 style="margin:18px 6px 10px">Kuis di perangkat ini</h3>${list(load(),false)}`},
mine(){app.innerHTML=`<h2 style="margin:6px 6px 14px">My Quizzes 📚</h2>${list(load(),true)}`},

share(id){const q=load().find(x=>x.id==id);if(!q){location.hash='#mine';return}
  app.innerHTML=`<div class="card center">${MASCOT}<h2>Link kuis siap! 🔗</h2><p>${esc(q.title)}</p><p class="hint">ID kuis: ${q.id}</p><label>Link kuis</label><input id="lnk" readonly value="${esc(link(q))}" onfocus="this.select()"><div class="acts c"><button class="btn" data-act="copyL">📋 Salin link</button><button class="btn blue" data-act="wa">💬 WhatsApp</button><button class="btn lav" data-act="play" data-id="${q.id}">▶ Main</button></div>${location.protocol==='file:'?`<p class="hint" style="margin-top:14px">⚠️ Kamu buka lewat file://, jadi link cuma jalan di perangkat ini. Host dulu (GitHub Pages / Netlify) biar bisa dibuka orang lain.</p>`:''}</div>`},

play(id){const q=load().find(x=>x.id==id);if(!q){toast('Kuis tidak ketemu 😢');location.hash='#home';return}G={q,i:0,score:0,right:0,lock:false};renderQ()},

result(){if(!R){location.hash='#home';return}
  const{q,score,right}=R,m=score==100?['Perfect! 🎉','Kamu jenius banget!']:score>=80?['Keren abis! ✨','Dikit lagi perfect~']:score>=60?['Lumayan nih! 🌸','Coba lagi biar makin jago']:score>=40?['Semangat! 🍓','Belajar dikit lagi ya']:['Gapapa, coba lagi! ☁️','Kamu pasti bisa!'];
  app.innerHTML=`<div class="card center">${MASCOT}<h2>${m[0]}</h2><p>${m[1]}</p><div class="ring"><b id="sc">0</b></div>
  <div class="stats"><div class="stat s1"><b>${score}</b>Skor</div><div class="stat s2"><b>${right}</b>Benar</div><div class="stat s3"><b>${10-right}</b>Salah</div><div class="stat s4"><b>10</b>Total soal</div></div>
  <div class="acts c"><button class="btn" data-act="retry">🔁 Ulangi</button><button class="btn blue" data-act="shareR">💌 Share hasil</button><a class="btn lav" href="#home">🏠 Home</a></div></div>`;
  const t0=performance.now(),ring=$('.ring'),sc=$('#sc');
  (function f(t){const p=Math.min((t-t0)/1200,1),v=Math.round(score*p);sc.textContent=v;ring.style.setProperty('--p',v);if(p<1)requestAnimationFrame(f)})(t0);
  if(score>=70)confetti()}
};

function renderQ(){const{q,i}=G,c=q.questions[i];G.lock=false;
  app.innerHTML=`<div class="card"><div class="top"><b>${esc(q.title)}</b><span class="pill">${i+1}/10</span></div><div class="bar"><i style="width:${i*10}%"></i></div></div>
  <div class="card qa"><h2>${esc(c.q)}</h2>${c.o.map((o,k)=>`<button class="opt" style="animation-delay:${k*.06}s" data-act="pick" data-k="${k}"><b>${'ABCD'[k]}</b>${esc(o)}</button>`).join('')}</div>`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const b=$('.bar i');if(b)b.style.width=(i+1)*10+'%'}))}

function finish(){const a=load(),x=a.find(y=>y.id==G.q.id);if(x){x.plays=(x.plays||0)+1;save(a)}R={q:G.q,score:G.score,right:G.right};location.hash='#result'}
function confetti(){for(let i=0;i<40;i++){const s=document.createElement('span');s.className='cf';s.textContent=['🎉','✨','💖','⭐','🌸','🎀'][Math.floor(Math.random()*6)];s.style.left=Math.random()*100+'vw';s.style.animationDelay=Math.random()*1.2+'s';document.body.append(s);setTimeout(()=>s.remove(),4500)}}

function importQ(s){try{const q=dec(s),a=load();if(!a.some(x=>x.id==q.id)){a.unshift(q);save(a)}location.hash='#play/'+q.id}catch{toast('Link kuis tidak valid 😢');location.hash='#home'}}

const A={
goto(d){D.step=+d.n;saveD();views.create()},
back(){D.step=Math.max(0,D.step-1);saveD();views.create()},
next(){const s=D.step;
  if(s==0){if(!D.title.trim()||!D.creator.trim())return toast('Isi judul & nama pembuat dulu ya 🌷')}
  else if(!isDone(D.questions[s-1]))return toast('Lengkapi soal, 4 opsi, dan pilih ⭐ jawaban benar');
  D.step=s+1;saveD();views.create();scrollTo(0,0)},
correct(d){D.questions[D.step-1].a=+d.k;saveD();views.create()},
publish(){const qs=D.questions,bad=qs.findIndex(q=>!isDone(q));
  if(!D.title.trim()||!D.creator.trim()){D.step=0;saveD();views.create();return toast('Judul & nama pembuat belum diisi')}
  if(qs.length!==10||bad>-1){D.step=bad+1;saveD();views.create();return toast(`Soal ${bad+1} belum lengkap. Harus tepat 10 soal!`)}
  const q={id:uid(),title:D.title.trim(),desc:D.desc.trim(),creator:D.creator.trim(),plays:0,questions:qs.map(x=>({q:x.q.trim(),o:x.o.map(o=>o.trim()),a:x.a}))};
  save([q,...load()]);D=newDraft();saveD();toast('Kuis terbit! 🎉');location.hash='#share/'+q.id},
play(d){location.hash='#play/'+d.id},
pick(d){if(G.lock)return;G.lock=true;const k=+d.k,c=G.q.questions[G.i],os=app.querySelectorAll('.opt');
  os[c.a].classList.add('ok');
  if(k==c.a){G.score+=10;G.right++}else os[k].classList.add('no');
  setTimeout(()=>{if(!location.hash.startsWith('#play'))return;G.i++;G.i<10?renderQ():finish()},1000)},
share(d){location.hash='#share/'+d.id},
copyL(){copy($('#lnk').value).then(()=>toast('Link disalin 🔗'))},
wa(){open('https://wa.me/?text='+encodeURIComponent('Yuk main kuis aku! 🎀 '+$('#lnk').value))},
del(d){if(confirm('Hapus kuis ini?')){save(load().filter(x=>x.id!=d.id));views.mine();toast('Kuis dihapus 🗑')}},
code(){const v=$('#code').value.trim(),i=v.indexOf('#q=');if(i<0)return toast('Tempel link kuis yang lengkap ya');importQ(v.slice(i+3))},
retry(){location.hash='#play/'+R.q.id},
shareR(){copy(`Aku dapat ${R.score}/100 di kuis "${R.q.title}" 🎀 Coba juga: ${link(R.q)}`).then(()=>toast('Hasil disalin, tinggal tempel 💌'))}
};

app.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b)A[b.dataset.act]?.(b.dataset)});
app.addEventListener('input',e=>{const t=e.target,d=t.dataset;
  if(d.f)D[d.f]=t.value;else if(d.q)D.questions[D.step-1].q=t.value;else if(d.o!==undefined)D.questions[D.step-1].o[+d.o]=t.value;else return;saveD()});

function route(){const h=location.hash.slice(1);if(h.startsWith('q=')){importQ(h.slice(2));return}
  const[p,id]=h.split('/');(views[p]||views.home)(id);scrollTo(0,0)}
addEventListener('hashchange',route);route();
