import sys
from PIL import Image
# sbs2.py <name-prefix> <w> <y0> <y1> <scale> <out>
pre,w,y0,y1,sc,o=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),float(sys.argv[5]),sys.argv[6]
a=Image.open(f'shots/cmp-{pre}-{w}-ref.png').convert('RGB'); b=Image.open(f'shots/cmp-{pre}-{w}-new.png').convert('RGB')
W=a.width; out=Image.new('RGB',(W*2+20,y1-y0),(255,0,255)); out.paste(a.crop((0,y0,W,y1)),(0,0)); out.paste(b.crop((0,y0,W,y1)),(W+20,0))
out=out.resize((int(out.width*sc),int(out.height*sc))); out.save(o); print(out.size)
