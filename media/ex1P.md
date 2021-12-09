# Prøve s1

@opp Forenkle (3p)

@math abc
ln(abc)-ln(c)-ln(a/b) - ln(b^2)
log(100)-log(4)-log(25)
(x^2-16)/(x+4) - (x-4)

@opp (1p)
Les av skjæring
@plot
1/2x-1;x^2-2x-3

@opp Løs likninger (3p)
@math abc likning
x+2=4
(ln(x))^2+2ln(x)=3
e^x-3=e^(-x)

@opp Rette linjer (2p)

Finn likningen for linja gjennom (2,3),(4,7)

@plot 200
[[0,0],[2,3],[4,7],[8,8]]

@opp Indre sirkel
I figuren ser du en trekant med inskrevet sirkel, hva er radius i sirkelen?

@trig senter 500 8
p = new Point(1,1)
ta = tri({p,a:6,b:6,c:6,ABC:"A,B,C",abc:"c,a,b",size:{w:300,s:8} }) 
size = ta.size
s = ta.center
r = ta.radius
tri2svg(ta)
svgCircle(s,r,size)
svgDot(s,size)
svgText(s,null,"S",size)
// legger på en liten tekst
v = s.sub(p).mult(.2)
p = ta.points.p1.add(v)
q = ta.points.p2.add(v)
svgText(q,p,"Hear me roar",size)
