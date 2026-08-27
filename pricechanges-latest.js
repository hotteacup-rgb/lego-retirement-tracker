(function(){
 const additions=[
  {setno:'42695',name:'Horse & Baby Foal Trailer',retailer:'Best Buy',type:'rise',oldPrice:19.19,newPrice:20.99,oldPct:36,newPct:30,when:'Aug. 27, 2026 • 12:58 PM PT',day:'2026-08-27',minute:778,newSale:false,newLow:false,retailerChanged:true,note:'The deeper $19.19 Target clearance is no longer the cheapest verified purchasable offer. Target is now $23.99 in stock; Best Buy is $20.99, sold by Best Buy, with pickup/shipping available. Historical low remains $19.19. Retirement remains Dec. 31, 2026 in current 2026 Friends retirement tracking.'},
  {setno:'42685',name:'Heartlake City Fashion Show',retailer:'Best Buy',type:'rise',oldPrice:31.19,newPrice:34.99,oldPct:38,newPct:30,when:'Aug. 27, 2026 • 12:58 PM PT',day:'2026-08-27',minute:778,newSale:false,newLow:false,retailerChanged:true,note:'The deeper $31.19 Target clearance has ended. Target is now $39.99 in stock; Best Buy is $34.99, sold by Best Buy, with pickup/shipping available. Historical low remains $31.19. Retirement remains Dec. 31, 2026 in current 2026 Friends retirement tracking.'}
 ];
 const old=window.PRICE_CHANGES||[];
 const keys=new Set(additions.map(x=>`${x.setno}|${x.when}|${x.type}`));
 window.PRICE_CHANGES=additions.concat(old.filter(x=>!keys.has(`${x.setno}|${x.when}|${x.type}`)));
 const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const rows=window.PRICE_CHANGES.slice().sort((a,b)=>(b.day||'').localeCompare(a.day||'')||((b.minute||0)-(a.minute||0)));
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const get=t=>parts.find(p=>p.type===t)?.value||'';
 const todayKey=`${get('year')}-${get('month')}-${get('day')}`;
 const today=rows.filter(x=>x.day===todayKey);
 const drops=today.filter(x=>x.type==='drop').length;
 const newSales=today.filter(x=>x.newSale).length;
 const largest=today.reduce((m,x)=>Math.max(m,(x.newPct||0)-(x.oldPct||0)),0);
 const latest=today.slice().sort((a,b)=>(b.minute||0)-(a.minute||0))[0];
 const pulse=document.getElementById('pricePulse');
 if(pulse){pulse.innerHTML=`<div class="changefeed-head"><div><p class="eyebrow dark">TODAY'S PRICE PULSE</p><h2>Verified LEGO price movement</h2></div><div class="changefeed-stats"><b>${drops} price drops / better sales</b><span>${newSales} newly-on-sale sets</span></div></div><div class="scoregrid"><div><span>Price drops / better sales</span><b>${drops}</b></div><div><span>Newly on sale</span><b>${newSales}</b></div><div><span>Largest discount improvement</span><b>+${largest} pts</b></div><div><span>Latest verified check</span><b>${latest?esc(latest.when.replace(/^.*•\s*/,'')):'No check today'}</b></div></div>`;}
 const host=document.getElementById('priceChanges');
 if(host){
  const badge=x=>{const b=[];if(x.newSale)b.push('<span class="pill green">NEW SALE</span>');if(x.newLow)b.push('<span class="pill blue">NEW LOW</span>');if(x.type==='drop'&&!x.newSale)b.push('<span class="pill green">DEEPER / RETURNED SALE</span>');if(x.type==='rise')b.push('<span class="pill red">PRICE INCREASE</span>');if(x.type==='saleended')b.push('<span class="pill red">SALE ENDED</span>');if(x.retailerChanged)b.push('<span class="pill amber">RETAILER CHANGED</span>');return b.join(' ')};
  host.innerHTML=`<div class="changefeed-head"><div><p class="eyebrow dark">PRICE MOVEMENT</p><h2>Latest verified changes</h2></div><div class="changefeed-stats"><b>${drops} drops / better sales today</b><span>${today.filter(x=>x.type==='rise'||x.type==='saleended').length} increases / sale endings today</span></div></div><div class="changefeed-grid">${rows.slice(0,40).map(x=>{const delta=(x.newPrice||0)-(x.oldPrice||0),pd=(x.newPct||0)-(x.oldPct||0);return `<article class="price-change ${x.type==='drop'?'down':'up'}"><div class="pc-top"><span>${esc(x.day===todayKey?'TODAY':'RECENT')}</span><b>${pd>0?'+':''}${pd} pts discount</b></div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px">${badge(x)}</div><h3>${esc(x.setno)} — ${esc(x.name)}</h3><p class="pc-price"><s>$${Number(x.oldPrice).toFixed(2)}</s> → <strong>$${Number(x.newPrice).toFixed(2)}</strong> at ${esc(x.retailer)}</p><p class="pc-discount">${x.oldPct}% off → <b>${x.newPct}% off</b>${delta<0?` • save $${Math.abs(delta).toFixed(2)} more`:delta>0?` • costs $${delta.toFixed(2)} more`:''}</p><p class="pc-note">${esc(x.note)}</p><small>Verified ${esc(x.when)}</small></article>`}).join('')}</div><p class="changefeed-foot">Verified U.S. retailer changes only. Amazon counts only when sold and shipped by Amazon; Walmart counts only when sold and shipped by Walmart. Third-party marketplace offers are excluded.</p>`;
 }
})();
