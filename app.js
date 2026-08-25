const SOURCES=[
{name:'LEGO.com U.S.',use:'Official MSRP, availability, sale pricing and Retiring Soon / Last Chance status'},
{name:'Brick Domain',use:'Live retirement dates and recent date-change tracking'},
{name:'Brick Fanatics',use:'Theme-by-theme 2026 retirement snapshots and monthly changes'},
{name:'Brickset',use:'Set metadata, release/exit records, ratings, ownership and wanted counts'},
{name:'BrickEconomy',use:'Secondary-market context and projections only; not treated as official retirement authority'},
{name:'Toys N Bricks',use:'U.S. Last Chance / retiring-soon snapshots and sale observations'},
{name:'Master the Bricks',use:'Independent multi-source retirement-roster cross-check'},
{name:'Brick Scouts',use:'Independent Last Chance / retired-status cross-check'},
{name:'Team Bricks',use:'Independent retirement timing cross-check'},
{name:"Jay's Brick Blog",use:'Independent set roster, pieces and U.S. MSRP cross-check'},
{name:'Brick Ranker',use:'Market/popularity context and post-retirement comparisons'},
{name:'Brick Sleuth',use:'Retailer-specific U.S. price-history cross-checks'},
{name:'Brickfall',use:'Broad current-retailer price discovery before direct verification'},
{name:'Amazon U.S.',use:'Current price only when sold by Amazon.com and shipped by Amazon'},
{name:'Walmart U.S.',use:'Current price only when sold and shipped by Walmart.com'},
{name:'Target / Best Buy / Barnes & Noble / LEGO',use:'Direct current U.S. retailer-price verification'},
{name:"Macy's / GameStop / Costco / Sam's Club",use:'Additional legitimate retailer checks where applicable'},
{name:'BrickLink / PriceCharting',use:'Secondary-market depth and sales context only; never used as retail-price winners'}
];
const DATE_LABELS={'2026-04-30':'April 30, 2026 — Retired','2026-07-31':'July 31, 2026 — Retired','2026-08-31':'August 31, 2026 — Next / Urgent','2026-12-31':'December 31, 2026 — Current tracker'};
const NOW=new Date('2026-08-24T23:13:00-07:00');
let DATA=[],WATCH=new Set(JSON.parse(localStorage.getItem('legoWatchlist')||'[]'));
const $=s=>document.querySelector(s), app=$('#app'),search=$('#search'),dateFilter=$('#dateFilter'),themeFilter=$('#themeFilter'),priorityFilter=$('#priorityFilter'),sortFilter=$('#sortFilter');

function money(v){const m=String(v||'').match(/\$([\d,]+(?:\.\d+)?)/);return m?Number(m[1].replace(/,/g,'')):null}
function discountPct(x){const a=money(x.msrp),b=money(x.current);return a&&b&&b<a?Math.round((1-b/a)*100):0}
function saleVerified(x){return discountPct(x)>0}
function daysLeft(x){const d=new Date(x.date+'T23:59:59-07:00');return Math.ceil((d-NOW)/86400000)}
function retirementMonth(x){return new Date(x.date+'T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'})}
function countdown(x){const d=daysLeft(x);if(d<0)return `${Math.abs(d)} days past retirement window`;if(d===0)return 'Retirement window ends today';if(d<=14)return `RETIRING IN ${d} DAYS`;if(d<=60)return `${d} days remaining`;return `~${Math.max(1,Math.round(d/30))} months remaining`}
function popScore(x){return ({'VERY HIGH':100,'HIGH':82,'MEDIUM':58,'LOW':35}[x.popularity]||50)}
function potScore(x){return ({'VERY HIGH':100,'HIGH':84,'MODERATE-HIGH':72,'MODERATE':58,'LOW-MODERATE':45,'LOW':30}[x.potential]||55)}
function retirementScore(x){const d=daysLeft(x);if(d<0)return 100;if(d<=14)return 100;if(d<=45)return 92;if(d<=90)return 82;if(d<=180)return 68;return 52}
function priceQuality(x){const pct=discountPct(x),cur=money(x.current),low=money(x.lowest);let score=pct>=35?100:pct>=25?88:pct>=20?78:pct>=15?68:pct>=10?58:pct>0?48:35;if(cur&&low){const gap=(cur-low)/low;if(gap<=.02)score=Math.max(score,95);else if(gap<=.08)score=Math.max(score,82);else if(gap>.2)score=Math.min(score,55)}if(!cur)score=25;return score}
function priceLabel(x){const q=priceQuality(x);return q>=90?'EXCELLENT':q>=75?'VERY GOOD':q>=60?'GOOD':q>=45?'FAIR':'WAIT'}
function supplyScore(x){return Math.round(retirementScore(x)*.65+popScore(x)*.35)}
function desirability(x){return Math.round(popScore(x)*.75+potScore(x)*.25)}
function investmentScore(x){return Math.round(potScore(x)*.55+popScore(x)*.2+retirementScore(x)*.15+priceQuality(x)*.1)}
function buyScore(x){return Math.round(retirementScore(x)*.30+priceQuality(x)*.28+popScore(x)*.18+potScore(x)*.14+supplyScore(x)*.10)}
function scoreCall(x){const s=buyScore(x),q=priceQuality(x),d=daysLeft(x);if(d<=31&&q>=60)return 'BUY NOW';if(s>=82&&q>=55)return 'BUY NOW';if(s>=68)return 'WATCH CLOSELY';return 'WAIT FOR A BETTER PRICE'}
function scoreClass(s){return s>=82?'hot':s>=68?'warm':'cool'}
function urgent(x){return daysLeft(x)<=45||x.risk==='RETIRED'||x.risk==='EXTREME'}
function currentRetailer(x){const s=String(x.current||'');const m=s.match(/—\s*([^()]+?)(?:\s*\(|$)/);return m?m[1].trim():null}
function retailerUrl(x){const r=currentRetailer(x),q=encodeURIComponent(`LEGO ${x.setno} ${x.name}`);if(!r)return null;const rr=r.toLowerCase();if(rr.includes('target'))return `https://www.target.com/s?searchTerm=${q}`;if(rr.includes('best buy'))return `https://www.bestbuy.com/site/searchpage.jsp?st=${q}`;if(rr.includes('barnes'))return `https://www.barnesandnoble.com/s/${q}`;if(rr.includes('gamestop'))return `https://www.gamestop.com/search/?q=${q}`;if(rr.includes('lego'))return `https://www.lego.com/en-us/search?q=${q}`;if(rr.includes('amazon'))return `https://www.amazon.com/s?k=${q}`;if(rr.includes('walmart'))return `https://www.walmart.com/search?q=${q}`;if(rr.includes("macy"))return `https://www.macys.com/shop/featured/${q}`;return null}
function priceChecked(x){return x.checked||((x.current&&x.current!=='Not verified today')?'Aug. 24, 2026 • time not captured':'Not verified today')}
function stockStatus(x){return x.stock||((x.current&&x.current!=='Not verified today')?'Price listing verified; stock not separately timestamped':'No verified winner today')}
function lowGap(x){const c=money(x.current),l=money(x.lowest);if(!c||!l)return 'Not enough verified history';const diff=c-l;if(Math.abs(diff)<.01)return 'At verified historical low';return `${diff>0?'+':''}$${Math.abs(diff).toFixed(2)} vs. verified low`}
function bestDiscount(x){const m=money(x.msrp),l=money(x.lowest);return m&&l&&l<m?`${Math.round((1-l/m)*100)}% off MSRP`:'Not enough verified history'}
function evidence(x){if(x.evidence)return x.evidence;return 'Included in the cross-referenced 2026 master roster. Exact source-by-source agreement count has not yet been stored for this individual set; confidence is shown separately rather than inventing a count.'}
function confidence(x){if(x.date<'2026-08-24')return'High — passed retirement window / exit evidence';if(x.date==='2026-08-31')return'High — current August retirement window';return'Current cross-source target — can change before year-end'}
function changeWarning(x){if(!x.previousDate)return'';return `<div class="change-warning">⚠️ DATE MOVED: <s>${escapeHtml(x.previousDate)}</s> → <b>${escapeHtml(x.date)}</b></div>`}
function toggleWatch(setno){WATCH.has(setno)?WATCH.delete(setno):WATCH.add(setno);localStorage.setItem('legoWatchlist',JSON.stringify([...WATCH]));render()}
window.toggleWatch=toggleWatch;
function imgFallback(img){if(!img.dataset.proxyTried){img.dataset.proxyTried='1';const original=img.dataset.original||img.src;img.dataset.original=original;img.src='https://images.weserv.nl/?url='+encodeURIComponent(original)+'&w=900&h=700&fit=contain&output=jpg';return}img.style.display='none';img.nextElementSibling.style.display='block'}
window.imgFallback=imgFallback;
function escapeHtml(v){return String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

function card(x){
 const score=buyScore(x),pct=discountPct(x),q=priceQuality(x),url=retailerUrl(x),watched=WATCH.has(String(x.setno)),d=daysLeft(x);
 return `<article class="card">
 <div class="picture"><button class="star ${watched?'on':''}" onclick="toggleWatch('${x.setno}')" aria-label="${watched?'Remove from':'Add to'} watchlist">${watched?'★':'☆'}</button><img loading="lazy" referrerpolicy="no-referrer" src="${x.image}" data-original="${x.image}" alt="LEGO ${x.setno} ${escapeHtml(x.name)}" onerror="imgFallback(this)"><div class="img-fail">Image temporarily unavailable<br><b>${x.setno}</b></div></div>
 <div class="body">
   <div class="name">${x.setno} — ${escapeHtml(x.name)}</div><div class="meta">${escapeHtml(x.theme)}${x.pieces?` • ${x.pieces.toLocaleString()} pieces`:''}</div>
   <div class="quickline"><span class="countdown ${d<=14?'danger':d<=60?'warn':''}">${escapeHtml(countdown(x))}</span><span class="score ${scoreClass(score)}">${score}/100</span></div>
   <div class="mobile-price">${money(x.current)?`$${money(x.current).toFixed(2)} • ${escapeHtml(currentRetailer(x)||'verified retailer')}${pct?` • ${pct}% OFF`:''}`:'No verified winner today'}</div>
   ${changeWarning(x)}
   <details class="details"><summary>More details</summary>
     <div class="row"><b>🗓 Retirement month</b><span>${escapeHtml(retirementMonth(x))}</span></div>
     <div class="row"><b>📅 Target date</b><span>${x.date}</span></div>
     <div class="row"><b>⏳ Countdown</b><span>${escapeHtml(countdown(x))}</span></div>
     <div class="row"><b>✅ Confidence</b><span>${escapeHtml(confidence(x))}</span></div>
     <div class="row"><b>💰 MSRP</b><span>${escapeHtml(x.msrp||'Not verified')}</span></div>
     <div class="pricebox ${saleVerified(x)?'verified-sale':''}">
       <div class="best">🏷️ BEST PRICE TODAY: ${escapeHtml(x.current==='Not verified today'?'No verified retailer winner yet':x.current)}</div>
       <div class="price-rating">Price quality: <b>${priceLabel(x)}</b> • ${q}/100 ${pct?`• ${pct}% below MSRP`:''}</div>
       <div class="meta">Checked: ${escapeHtml(priceChecked(x))} • ${escapeHtml(stockStatus(x))}</div>
       ${url?`<a class="buybtn" href="${url}" target="_blank" rel="noopener">Shop ${escapeHtml(currentRetailer(x))}</a>`:''}
     </div>
     <div class="history">
       <div><span>Historical low</span><b>${escapeHtml(x.lowest||'Not verified')}</b></div>
       <div><span>Current vs. low</span><b>${escapeHtml(lowGap(x))}</b></div>
       <div><span>Best verified discount</span><b>${escapeHtml(bestDiscount(x))}</b></div>
       <div><span>Typical sale</span><b>${escapeHtml(x.typicalSale||'Not enough verified history')}</b></div>
     </div>
     <div class="scoregrid">
       <div><span>Collector demand</span><b>${desirability(x)}/100</b></div>
       <div><span>Supply / sellout risk</span><b>${supplyScore(x)}/100</b></div>
       <div><span>Post-retirement outlook</span><b>${investmentScore(x)}/100</b></div>
       <div><span>Price quality</span><b>${q}/100</b></div>
     </div>
     <div class="row"><b>⭐ Popularity</b><span>${escapeHtml(x.popularity||'—')}</span></div>
     <div class="row"><b>📈 Appreciation</b><span>${escapeHtml(x.potential||'—')}</span></div>
     <div class="row"><b>🎯 Target price</b><span>${escapeHtml(x.target||'—')}</span></div>
     <div class="evidence"><b>🔎 Retirement evidence</b><p>${escapeHtml(evidence(x))}</p></div>
   </details>
   <div class="call ${scoreClass(score)}">🚦 ${scoreCall(x)} • BUY PRIORITY ${score}/100</div>
 </div></article>`;
}

function dashboardCard(x,label){const pct=discountPct(x);return `<button class="dash-card" data-set="${x.setno}"><span>${label}</span><b>${x.setno} — ${escapeHtml(x.name)}</b><small>${escapeHtml(countdown(x))}${money(x.current)?` • $${money(x.current).toFixed(2)}${pct?` • ${pct}% off`:''}`:''}</small></button>`}
function renderDashboard(rows){
 const future=rows.filter(x=>daysLeft(x)>=0);
 const buy=[...future].sort((a,b)=>buyScore(b)-buyScore(a)).slice(0,4);
 const deals=[...future].filter(saleVerified).sort((a,b)=>discountPct(b)-discountPct(a)).slice(0,4);
 const next=[...future].sort((a,b)=>daysLeft(a)-daysLeft(b)).slice(0,4);
 const invest=[...future].sort((a,b)=>investmentScore(b)-investmentScore(a)).slice(0,4);
 const clearance=[...future].filter(x=>daysLeft(x)<=90&&discountPct(x)>=20).sort((a,b)=>buyScore(b)-buyScore(a)).slice(0,6);
 const watched=rows.filter(x=>WATCH.has(String(x.setno))).slice(0,8);
 const changes=window.RETIREMENT_CHANGES||[];
 $('#dashboard').innerHTML=`<div class="dash-title"><div><p class="eyebrow dark">DECISION DASHBOARD</p><h2>What deserves attention first</h2></div><span>Scores are decision aids, not guaranteed investment returns.</span></div>
 <div class="dash-groups">
  <section><h3>🔥 Buy Immediately</h3>${buy.map(x=>dashboardCard(x,`${buyScore(x)}/100`)).join('')}</section>
  <section><h3>💰 Biggest Discounts</h3>${deals.length?deals.map(x=>dashboardCard(x,`${discountPct(x)}% OFF`)).join(''):'<p class="muted">No verified sales in the current price pass.</p>'}</section>
  <section><h3>⏰ Retiring Next</h3>${next.map(x=>dashboardCard(x,`${daysLeft(x)}d`)).join('')}</section>
  <section><h3>📈 Appreciation Candidates</h3>${invest.map(x=>dashboardCard(x,`${investmentScore(x)}/100`)).join('')}</section>
 </div>
 <section class="clearance"><h3>🚨 Clearance + Retiring ≤90 days</h3><div class="clearance-row">${clearance.length?clearance.map(x=>dashboardCard(x,`${discountPct(x)}% OFF`)).join(''):'<p class="muted">No qualifying verified deals right now.</p>'}</div></section>
 ${watched.length?`<section class="clearance"><h3>⭐ My Watchlist</h3><div class="clearance-row">${watched.map(x=>dashboardCard(x,'WATCHING')).join('')}</div></section>`:''}
 ${changes.length?`<section class="changes"><h3>⚠️ Recent retirement-date changes</h3>${changes.map(c=>`<p><b>${escapeHtml(c.setno)} — ${escapeHtml(c.name)}</b>: ${escapeHtml(c.from)} → ${escapeHtml(c.to)}. ${escapeHtml(c.note||'')}</p>`).join('')}</section>`:''}`;
 document.querySelectorAll('.dash-card').forEach(b=>b.onclick=()=>{search.value=b.dataset.set;render();setTimeout(()=>document.querySelector('.card')?.scrollIntoView({behavior:'smooth',block:'center'}),50)});
}

function sortRows(rows,mode){const r=[...rows];const sorters={
 retirement:(a,b)=>a.date.localeCompare(b.date)||a.theme.localeCompare(b.theme)||String(a.setno).localeCompare(String(b.setno),undefined,{numeric:true}),
 discount:(a,b)=>discountPct(b)-discountPct(a)||buyScore(b)-buyScore(a),
 score:(a,b)=>buyScore(b)-buyScore(a),
 popularity:(a,b)=>popScore(b)-popScore(a)||buyScore(b)-buyScore(a),
 investment:(a,b)=>investmentScore(b)-investmentScore(a),
 priceLow:(a,b)=>(money(a.current)??1e9)-(money(b.current)??1e9),
 priceHigh:(a,b)=>(money(b.current)??-1)-(money(a.current)??-1)
};return r.sort(sorters[mode]||sorters.retirement)}

function render(){
 const q=search.value.trim().toLowerCase(),d=dateFilter.value,t=themeFilter.value,p=priorityFilter.value;
 let rows=DATA.filter(x=>(!q||`${x.setno} ${x.name}`.toLowerCase().includes(q))&&(!d||x.date===d)&&(!t||x.theme===t)&&(!p||(p==='urgent'&&urgent(x))||(p==='high'&&['VERY HIGH','HIGH'].includes(x.popularity))||(p==='sale'&&saleVerified(x))||(p==='watchlist'&&WATCH.has(String(x.setno)))||(p==='clearance'&&daysLeft(x)>=0&&daysLeft(x)<=90&&discountPct(x)>=20)));
 rows=sortRows(rows,sortFilter.value);
 $('#resultsMeta').textContent=`Showing ${rows.length.toLocaleString()} of ${DATA.length.toLocaleString()} sets`;
 renderDashboard(DATA);
 if(!rows.length){app.innerHTML='<div class="empty">No sets match those filters.</div>';return}
 if(sortFilter.value!=='retirement'){app.innerHTML=`<section class="theme-section"><div class="theme-head"><h3>${escapeHtml(sortFilter.options[sortFilter.selectedIndex].text)}</h3><span>${rows.length} sets</span></div><div class="grid">${rows.map(card).join('')}</div></section>`;return}
 let html='';
 for(const date of [...new Set(rows.map(x=>x.date))].sort()){const dr=rows.filter(x=>x.date===date);html+=`<section class="date-section"><div class="date-head"><h2>${DATE_LABELS[date]||date}</h2><span>${dr.length} sets</span></div>`;
 for(const theme of [...new Set(dr.map(x=>x.theme))].sort()){const tr=dr.filter(x=>x.theme===theme);html+=`<section class="theme-section"><div class="theme-head"><h3>${escapeHtml(theme)}</h3><span>${tr.length} sets</span></div><div class="grid">${tr.map(card).join('')}</div></section>`}html+='</section>'}app.innerHTML=html
}
function setup(){
 const dates=[...new Set(DATA.map(x=>x.date))].sort(),themes=[...new Set(DATA.map(x=>x.theme))].sort();
 dateFilter.innerHTML+=$dates(dates);themeFilter.innerHTML+=themes.map(t=>`<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
 $('#setCount').textContent=DATA.length.toLocaleString();$('#sourceCount').textContent=SOURCES.length;$('#urgentCount').textContent=DATA.filter(urgent).length.toLocaleString();
 search.addEventListener('input',render);[dateFilter,themeFilter,priorityFilter,sortFilter].forEach(el=>el.addEventListener('change',render));
 $('#clear').onclick=()=>{search.value='';dateFilter.value='';themeFilter.value='';priorityFilter.value='';sortFilter.value='retirement';render()};
 const dlg=$('#sourcesDialog');$('#sourceBtn').onclick=()=>dlg.showModal();$('#closeSources').onclick=()=>dlg.close();
 $('#sourcesList').innerHTML=`<div class="source-list">${SOURCES.map(s=>`<div class="source-item"><b>${escapeHtml(s.name)}</b><span>${escapeHtml(s.use)}</span></div>`).join('')}</div>`;
 render()
}
function $dates(ds){return ds.map(d=>`<option value="${d}">${DATE_LABELS[d]||d}</option>`).join('')}
function applyPatches(rows){
 const corrections=window.DATA_CORRECTIONS||{};rows=rows.map(x=>{const patch=corrections[x.setno];return patch?{...x,...patch}:x});
 const seen=new Set(rows.map(x=>x.setno));for(const x of (window.DATA_ADDITIONS||[])){if(!seen.has(x.setno)){rows.push(x);seen.add(x.setno)}}
 const removed=new Set((window.DATA_REMOVALS||[]).map(String));rows=rows.filter(x=>!removed.has(String(x.setno)));
 const prices=window.DATA_PRICE_PATCHES||{};rows=rows.map(x=>prices[x.setno]?{...x,...prices[x.setno]}:x);
 const evidence=window.DATA_EVIDENCE_PATCHES||{};rows=rows.map(x=>evidence[x.setno]?{...x,...evidence[x.setno]}:x);
 return rows.sort((a,b)=>a.date.localeCompare(b.date)||a.theme.localeCompare(b.theme)||String(a.setno).localeCompare(String(b.setno),undefined,{numeric:true}))
}
(async()=>{try{const raw=Uint8Array.from(atob((window.DATA_PARTS||[]).join('')),c=>c.charCodeAt(0));const ds=new DecompressionStream('gzip');const txt=await new Response(new Blob([raw]).stream().pipeThrough(ds)).text();DATA=applyPatches(JSON.parse(txt));setup()}catch(e){app.innerHTML=`<div class="empty"><b>Could not load tracker data.</b><br>${escapeHtml(e.message)}</div>`}})();