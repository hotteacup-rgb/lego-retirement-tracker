import base64, gzip, json, re
from pathlib import Path

parts=[]
for path in sorted(Path('.').glob('data*.js')):
    m=re.search(r"DATA_PARTS\[(\d+)\]='([^']+)'", path.read_text())
    if m:
        parts.append((int(m.group(1)),m.group(2)))
parts=[p for _,p in sorted(parts)]
rows=json.loads(gzip.decompress(base64.b64decode(''.join(parts))))

patch_text=Path('patches.js').read_text()
def extract_json(name, opener, closer):
    start=patch_text.index(name)+len(name)
    start=patch_text.index(opener,start)
    depth=0
    in_str=False
    esc=False
    for i in range(start,len(patch_text)):
        c=patch_text[i]
        if in_str:
            if esc: esc=False
            elif c=='\\': esc=True
            elif c=='"': in_str=False
            continue
        if c=='"': in_str=True
        elif c==opener: depth+=1
        elif c==closer:
            depth-=1
            if depth==0: return patch_text[start:i+1]
    raise ValueError(name)

corrections=json.loads(extract_json('window.DATA_CORRECTIONS=', '{','}'))
additions=json.loads(extract_json('window.DATA_ADDITIONS=', '[',']'))
for r in rows:
    if str(r['setno']) in corrections:
        r.update(corrections[str(r['setno'])])
seen={str(r['setno']) for r in rows}
for r in additions:
    if str(r['setno']) not in seen:
        rows.append(r); seen.add(str(r['setno']))

rows.sort(key=lambda r:(r.get('date',''),r.get('theme',''),str(r.get('setno',''))))
nums=[str(r.get('setno','')) for r in rows]
dupes=sorted({n for n in nums if nums.count(n)>1})
missing_images=[n for n,r in zip(nums,rows) if not r.get('image')]
missing_dates=[n for n,r in zip(nums,rows) if not r.get('date')]
by_date={}
for r in rows: by_date[r.get('date','UNKNOWN')]=by_date.get(r.get('date','UNKNOWN'),0)+1
by_theme={}
for r in rows: by_theme[r.get('theme','UNKNOWN')]=by_theme.get(r.get('theme','UNKNOWN'),0)+1
report={
  'set_count':len(rows),
  'unique_set_numbers':len(set(nums)),
  'duplicates':dupes,
  'missing_images':missing_images,
  'missing_dates':missing_dates,
  'by_date':dict(sorted(by_date.items())),
  'by_theme':dict(sorted(by_theme.items())),
  'set_numbers':nums
}
Path('validation.json').write_text(json.dumps(report,indent=2))
Path('catalog.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='set_numbers'},indent=2))
if dupes or missing_images or missing_dates:
    raise SystemExit('Catalog integrity validation failed')
