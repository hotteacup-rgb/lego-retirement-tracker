(function(){
 const excludedThemes=Object.freeze([
  'Animal Crossing',
  'Bluey',
  'City',
  'Creator 3-in-1',
  'DUPLO',
  'Fortnite',
  'Friends',
  "Gabby's Dollhouse",
  'Minecraft',
  'NINJAGO',
  'Nike',
  'One Piece',
  'Sonic',
  'Wednesday',
  'Wicked'
 ]);
 const normalize=value=>String(value??'').trim().toLocaleLowerCase('en-US');
 const excludedThemeKeys=new Set(excludedThemes.map(normalize));

 // Permanent owner preference. Catalog, price and retirement update layers must
 // all call these helpers so an excluded theme cannot be reintroduced later.
 window.TRACKER_PREFERENCES=Object.freeze({
  excludedThemes,
  excludedThemeUpdates:Object.freeze({catalog:false,prices:false,retirement:false})
 });
 window.isThemeExcluded=theme=>excludedThemeKeys.has(normalize(theme));
 window.shouldTrackSet=set=>Boolean(set)&&!window.isThemeExcluded(set.theme);
 window.isTrackedSetNumber=setno=>window.TRACKED_SETNOS instanceof Set&&window.TRACKED_SETNOS.has(String(setno));
})();