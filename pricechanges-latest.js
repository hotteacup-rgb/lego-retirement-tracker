(function(){
 const additions=[
  {setno:'42677',name:'Dog Treats Bakery',retailer:'Target / Best Buy',type:'rise',oldPrice:12.99,newPrice:17.99,oldPct:57,newPct:40,when:'Aug. 29, 2026 • 5:00 AM PT',day:'2026-08-29',minute:300,newSale:false,newLow:false,retailerChanged:true,note:'The $12.99 Best Buy clearance has ended. Target and Best Buy are now tied at $17.99 (40% off), with Target in stock and Best Buy sold by Best Buy with Add to cart. The $12.99 historical low is preserved. Retirement remains Dec. 31, 2026.'},
  {setno:'42649',name:'Heartlake City Candy Store',retailer:'Target',type:'rise',oldPrice:24.99,newPrice:27.49,oldPct:17,newPct:8,when:'Aug. 28, 2026 • 6:13 PM PT',day:'2026-08-28',minute:1093,newSale:false,newLow:false,retailerChanged:false,note:'The $24.99 Target sale has ended. Target is back to $27.49 and remains the cheapest verified qualifying retailer versus LEGO U.S. at $29.99. The $24.99 historical low is preserved. Retirement remains Dec. 31, 2026.'},
  {setno:'42649',name:'Heartlake City Candy Store',retailer:'Target',type:'drop',oldPrice:27.49,newPrice:24.99,oldPct:8,newPct:17,when:'Aug. 28, 2026 • 5:16 PM PT',day:'2026-08-28',minute:1036,newSale:false,newLow:false,retailerChanged:false,note:'Target temporarily dropped back to $24.99, restoring the 17% discount and matching the existing verified historical low.'}
 ];
 const old=window.PRICE_CHANGES||[];
 const keys=new Set(additions.map(x=>`${x.setno}|${x.when}|${x.type}`));
 window.PRICE_CHANGES=additions.concat(old.filter(x=>!keys.has(`${x.setno}|${x.when}|${x.type}`)));
 if(typeof window.renderPricePulse==='function') window.renderPricePulse();
 if(typeof window.renderPriceChanges==='function') window.renderPriceChanges();
})();