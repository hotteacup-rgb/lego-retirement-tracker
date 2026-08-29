(function(){
 const esc=value=>String(value??'').replace(/[&<>\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
 let guardedChanges=[];
 let guardInstalled=false;
 let renderQueued=false;

 function allowed(change){
  if(!change)return false;
  const setno=String(change.setno??'');
  if(window.EXCLUDED_SETNOS?.has(setno))return false;
  if(window.TRACKED_SETNOS instanceof Set)return window.TRACKED_SETNOS.has(setno);
  const theme=change.theme||window.TRACKER_THEME_BY_SETNO?.[setno];
  return !window.isThemeExcluded?.(theme);
 }

 function queueRender(){
  if(renderQueued)return;
  renderQueued=true;
  queueMicrotask(()=>{renderQueued=false;render()});
 }

 function guardArray(value){
  const rows=(Array.isArray(value)?value:[]).filter(allowed);
  Object.defineProperties(rows,{
   push:{configurable:true,value:function(...items){const length=Array.prototype.push.apply(this,items.filter(allowed));queueRender();return length}},
   unshift:{configurable:true,value:function(...items){const length=Array.prototype.unshift.apply(this,items.filter(allowed));queueRender();return length}},
   splice:{configurable:true,value:function(start,deleteCount,...items){const result=Array.prototype.splice.call(this,start,deleteCount,...items.filter(allowed));queueRender();return result}}
  });
  return rows;
 }

 function installGuard(){
  if(guardInstalled||!(window.TRACKED_SETNOS instanceof Set))return;
  guardedChanges=guardArray(window.PRICE_CHANGES||[]);
  try{
   Object.defineProperty(window,'PRICE_CHANGES',{
    configurable:true,
    get:()=>guardedChanges,
    set:value=>{guardedChanges=guardArray(value);queueRender()}
   });
   guardInstalled=true;
  }catch(error){
   window.PRICE_CHANGES=guardedChanges;
  }
 }

 function kind(change){
  if(change.type==='rise')return['up','↑ PRICE INCREASE'];
  if(change.type==='saleended'||change.type==='ending')return['saleended','SALE ENDED'];
  if(change.newSale&&change.newLow)return['newlow','NEW SALE • NEW HISTORICAL LOW'];
  if(change.newSale)return['newsale','NEW SALE'];
  if(change.newLow)return['newlow','NEW HISTORICAL LOW'];
  if(change.retailerChanged)return['retailer','RETAILER WINNER CHANGED'];
  if((change.newPct||0)>(change.oldPct||0))return['deeper','DEEPER DISCOUNT'];
  return['down','↓ PRICE DROP'];
 }

 function render(){
  if(!(window.TRACKED_SETNOS instanceof Set))return;
  installGuard();
  if(!guardInstalled)guardedChanges=guardArray(window.PRICE_CHANGES||[]);
  const rows=(guardInstalled?guardedChanges:window.PRICE_CHANGES||[]).filter(allowed).sort((a,b)=>String(b.day||'').localeCompare(String(a.day||''))||((b.minute||0)-(a.minute||0)));
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=type=>parts.find(part=>part.type===type)?.value||'';
  const pacificDay=`${get('year')}-${get('month')}-${get('day')}`;
  const today=rows.filter(change=>change.day===pacificDay);
  const drops=today.filter(change=>change.type==='drop').length;
  const newSales=today.filter(change=>change.newSale).length;
  const best=today.reduce((maximum,change)=>Math.max(maximum,(change.newPct||0)-(change.oldPct||0)),0);
  const latest=today.reduce((current,change)=>(change.minute||0)>(current.minute||-1)?change:current,{minute:-1,when:'No verified check today'});
  const pulse=document.getElementById('pricePulse');
  if(pulse)pulse.innerHTML=`<div class="pulse-head"><div><p class="eyebrow dark">TODAY'S PRICE PULSE</p><h2>Verified LEGO price changes today</h2></div><span>Computed from stored verified price-change history</span></div><div class="pulse-grid"><div><strong>${drops}</strong><span>price drops / better sales</span></div><div><strong>${newSales}</strong><span>newly-on-sale sets</span></div><div><strong>+${best} pts</strong><span>largest discount improvement</span></div><div><strong>${latest.minute>=0?esc(latest.when.split('•')[1]?.trim()||latest.when):'—'}</strong><span>latest verified check</span></div></div>`;
  const host=document.getElementById('priceChanges');
  if(!host)return;
  const cards=rows.map(change=>{const [cls,label]=kind(change),delta=(change.newPct||0)-(change.oldPct||0);return `<article class="price-change ${cls}"><div class="pc-top"><span>${label}</span><b>${delta>0?'+':''}${delta} pts discount</b></div><h3>${esc(change.setno)} — ${esc(change.name)}</h3><p class="pc-price"><s>$${Number(change.oldPrice).toFixed(2)}</s> → <strong>$${Number(change.newPrice).toFixed(2)}</strong> at ${esc(change.retailer)}</p><p class="pc-discount">${change.oldPct}% off → <b>${change.newPct}% off</b></p><p class="pc-note">${esc(change.note)}</p><small>Verified ${esc(change.when)}</small></article>`}).join('');
  host.innerHTML=`<div class="changefeed-head"><div><p class="eyebrow dark">PRICE MOVEMENT</p><h2>Verified changes, newest first</h2></div><div class="changefeed-stats"><b>${drops} drops today</b><span>${today.filter(change=>change.type==='rise'||change.type==='saleended'||change.type==='ending').length} increases / sale endings today</span></div></div>${cards?`<div class="changefeed-grid">${cards}</div>`:'<p class="muted">No verified price changes for the themes you track yet.</p>'}<p class="changefeed-foot">Today's entries appear first. Amazon and Walmart offers are only counted when the required first-party seller and shipping conditions are verified.</p>`;
 }

 window.renderAllowedPriceChanges=render;
 window.addEventListener('tracker:dataready',render);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});
 else queueRender();
})();