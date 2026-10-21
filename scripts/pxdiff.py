# pxdiff.py <prefix> <w> : bands of rows where ref/new screenshots differ (mean abs diff > 12), to locate regions
import sys
from PIL import Image, ImageChops
pre,w=sys.argv[1],sys.argv[2]
a=Image.open(f'shots/cmp-{pre}-{w}-ref.png').convert('L'); b=Image.open(f'shots/cmp-{pre}-{w}-new.png').convert('L')
H=min(a.height,b.height); d=ImageChops.difference(a.crop((0,0,a.width,H)),b.crop((0,0,a.width,H)))
bands=[];cur=None; tot=0
for y in range(0,H,4):
    row=d.crop((0,y,d.width,y+4)); s=sum(row.get_flattened_data())/(row.width*row.height); tot+=s
    if s>12:
        if cur and y-cur[1]<=16: cur[1]=y+4; cur[2]=max(cur[2],s)
        else: cur=[y,y+4,s]; bands.append(cur)
print(f'{pre} {w}: h ref {a.height} new {b.height}; mean diff {tot/(H/4):.2f}')
for y0,y1,m in bands: print(f'  rows {y0}-{y1} max {m:.0f}')
