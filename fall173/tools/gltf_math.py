import json,struct,math
def load_glb(p):
    raw=open(p,'rb').read();l=struct.unpack('<I',raw[12:16])[0];j=json.loads(raw[20:20+l]);o=20+l
    bl=struct.unpack('<I',raw[o:o+4])[0];bin=raw[o+8:o+8+bl];return j,bin
def accessor(j,bin,i):
    a=j['accessors'][i];bv=j['bufferViews'][a['bufferView']];n={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
    fmt={5126:'f',5123:'H',5121:'B',5125:'I'}[a['componentType']];sz=struct.calcsize(fmt)
    off=bv.get('byteOffset',0)+a.get('byteOffset',0);stride=bv.get('byteStride',0) or n*sz
    return [list(struct.unpack_from('<'+fmt*n,bin,off+k*stride)) for k in range(a['count'])]
def qmul(a,b):
    x1,y1,z1,w1=a;x2,y2,z2,w2=b
    return [w1*x2+x1*w2+y1*z2-z1*y2,w1*y2-x1*z2+y1*w2+z1*x2,w1*z2+x1*y2-y1*x2+z1*w2,w1*w2-x1*x2-y1*y2-z1*z2]
def qinv(q):return [-q[0],-q[1],-q[2],q[3]]
def qnorm(q):n=math.sqrt(sum(v*v for v in q));return [v/n for v in q]
def qrot(q,v):r=qmul(qmul(q,[v[0],v[1],v[2],0]),qinv(q));return r[:3]
def mat_from_trs(t,r,s):
    x,y,z,w=r
    R=[[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]]
    return [[R[i][0]*s[0],R[i][1]*s[1],R[i][2]*s[2],t[i]] for i in range(3)]+[[0,0,0,1]]
def mmul(A,B):return [[sum(A[i][k]*B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
def mat_to_quat(M):
    c=[[M[i][j] for j in range(3)] for i in range(3)]
    for j in range(3):
        n=math.sqrt(sum(c[i][j]**2 for i in range(3)));
        for i in range(3):c[i][j]/=n
    m00,m01,m02=c[0];m10,m11,m12=c[1];m20,m21,m22=c[2];tr=m00+m11+m22
    if tr>0:S=math.sqrt(tr+1)*2;return qnorm([(m21-m12)/S,(m02-m20)/S,(m10-m01)/S,.25*S])
    if m00>m11 and m00>m22:S=math.sqrt(1+m00-m11-m22)*2;return qnorm([.25*S,(m01+m10)/S,(m02+m20)/S,(m21-m12)/S])
    if m11>m22:S=math.sqrt(1+m11-m00-m22)*2;return qnorm([(m01+m10)/S,.25*S,(m12+m21)/S,(m02-m20)/S])
    S=math.sqrt(1+m22-m00-m11)*2;return qnorm([(m02+m20)/S,(m12+m21)/S,.25*S,(m10-m01)/S])
def node_world(j):
    par={}
    for i,n in enumerate(j['nodes']):
        for c in n.get('children',[]):par[c]=i
    W={}
    def get(i):
        if i in W:return W[i]
        n=j['nodes'][i]
        L=[[n['matrix'][c*4+r] for c in range(4)] for r in range(4)] if 'matrix' in n else mat_from_trs(n.get('translation',[0,0,0]),n.get('rotation',[0,0,0,1]),n.get('scale',[1,1,1]))
        W[i]=mmul(get(par[i]),L) if i in par else L;return W[i]
    for i in range(len(j['nodes'])):get(i)
    return W,par
