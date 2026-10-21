#!/bin/sh
# usage: lh.sh <url> <name> <mobile|desktop>   (starts one headless chrome at a time, per PC cap)
CH=$(ls /var/home/uruk/arkhitektonian-lab/.cache/ms-playwright/chromium_headless_shell-1248/*/chrome-headless-shell | head -1)
P=""; [ "$3" = desktop ] && P="--preset=desktop"
D=$(mktemp -d); "$CH" --no-sandbox --disable-gpu --remote-debugging-port=9333 --user-data-dir=$D about:blank >/dev/null 2>&1 &
CP=$!; sleep 4
npx lighthouse "$1" $P --port=9333 --quiet --output=json --output-path=out-$2-$3.json --only-categories=performance,accessibility,best-practices,seo >lh.log 2>&1
kill $CP 2>/dev/null; sleep 1
python3 - "$2" "$3" <<'P'
import json,sys
d=json.load(open(f'out-{sys.argv[1]}-{sys.argv[2]}.json'));c=d['categories'];a=d['audits']
print(sys.argv[1],sys.argv[2],{k:round(v['score']*100) for k,v in c.items()},{k:a[k]['displayValue'] for k in ['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'] if k in a},'bytes',a['total-byte-weight']['displayValue'])
P
