import sys
from PIL import Image
# usage: sbs.py prefix w y0 y1 [scale]
pre,w,y0,y1=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]); sc=float(sys.argv[5]) if len(sys.argv)>5 else .5
a=Image.open(f'shots/cmp-{pre}-{w}-ref.png').convert('RGB'); b=Image.open(f'shots/cmp-{pre}-{w}-new.png').convert('RGB')
h=y1-y0; W=a.width
out=Image.new('RGB',(W*2+10,h),(255,0,255))
out.paste(a.crop((0,y0,W,y1)),(0,0)); out.paste(b.crop((0,y0,W,y1)),(W+10,0))
out=out.resize((int(out.width*sc),int(out.height*sc)))
out.save(f'shots/sbs-{pre}-{w}-{y0}.png'); print(out.size)
