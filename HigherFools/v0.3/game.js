'use strict';
(()=>{
const $=id=>document.getElementById(id), canvas=$('world');
let gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,premultipliedAlpha:false})||canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,premultipliedAlpha:false});
const software=!gl; const soft=software?canvas.getContext('2d',{alpha:true}):null;
if(software&&!soft){$('fatal').hidden=false;return;}
if(software){const noop=()=>{};gl={VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,DEPTH_TEST:5,LEQUAL:6,CULL_FACE:7,BLEND:8,SRC_ALPHA:9,ONE_MINUS_SRC_ALPHA:10,ARRAY_BUFFER:11,STATIC_DRAW:12,DYNAMIC_DRAW:13,FLOAT:14,TRIANGLES:15,COLOR_BUFFER_BIT:16,DEPTH_BUFFER_BIT:17,createShader:()=>({}),shaderSource:noop,compileShader:noop,getShaderParameter:()=>true,getShaderInfoLog:()=>'',createProgram:()=>({}),attachShader:noop,linkProgram:noop,getProgramParameter:()=>true,getProgramInfoLog:()=>'',useProgram:noop,enable:noop,disable:noop,depthFunc:noop,blendFunc:noop,getAttribLocation:()=>0,getUniformLocation:()=>0,createBuffer:()=>({}),bindBuffer:noop,bufferData:noop,enableVertexAttribArray:noop,vertexAttribPointer:noop,uniformMatrix4fv:noop,drawArrays:noop,viewport:noop,clearColor:noop,clear:noop};}

const VS=`attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;uniform mat4 uVP;uniform mat4 uM;varying vec3 vC;varying vec3 vN;varying vec3 vW;void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=mat3(uM)*aN;vC=aC;gl_Position=uVP*w;}`;
const FS=`precision mediump float;varying vec3 vC;varying vec3 vN;varying vec3 vW;void main(){vec3 n=normalize(vN);float li=max(dot(n,normalize(vec3(-0.5,0.87,0.8))),0.);float shade=.66+li*.41;vec3 col=vC*shade;float fog=clamp((-vW.z-5.)/42.,0.,.36);col=mix(col,vec3(.72,.82,.92),fog);gl_FragColor=vec4(col,1.);}`;
function shader(type,text){const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,VS));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}catch(e){$('fatal').textContent='Erro ao iniciar WebGL: '+e.message;$('fatal').hidden=false;return;}
gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
const loc={p:gl.getAttribLocation(program,'aP'),n:gl.getAttribLocation(program,'aN'),c:gl.getAttribLocation(program,'aC'),vp:gl.getUniformLocation(program,'uVP'),m:gl.getUniformLocation(program,'uM')};
const PI=Math.PI, clamp=(n,a,b)=>Math.min(b,Math.max(a,n)), lerp=(a,b,t)=>a+(b-a)*t;
const mat=()=>new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let v=0;for(let k=0;k<4;k++)v+=a[k*4+r]*b[c*4+k];o[c*4+r]=v}return o}
function tr(x,y,z){const m=mat();m[12]=x;m[13]=y;m[14]=z;return m}function sc(x,y,z){const m=mat();m[0]=x;m[5]=y;m[10]=z;return m}function rz(t){const m=mat(),c=Math.cos(t),s=Math.sin(t);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m}function ry(t){const m=mat(),c=Math.cos(t),s=Math.sin(t);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m}
function model(x,y,z,sx,sy,sz,ang=0){return mul(tr(x,y,z),mul(rz(ang),sc(sx,sy,sz)))}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function norm(v){let l=Math.hypot(...v)||1;return v.map(x=>x/l)}function sub(a,b){return a.map((v,i)=>v-b[i])}function dot(a,b){return a.reduce((s,v,i)=>s+v*b[i],0)}
function lookAt(eye,at,up){let z=norm(sub(eye,at)),x=norm(cross(up,z)),y=cross(z,x),m=mat();m[0]=x[0];m[1]=y[0];m[2]=z[0];m[4]=x[1];m[5]=y[1];m[6]=z[1];m[8]=x[2];m[9]=y[2];m[10]=z[2];m[12]=-dot(x,eye);m[13]=-dot(y,eye);m[14]=-dot(z,eye);return m}
function perspective(fovy,asp,near,far){const f=1/Math.tan(fovy/2),o=new Float32Array(16);o[0]=f/asp;o[5]=f;o[10]=(far+near)/(near-far);o[11]=-1;o[14]=(2*far*near)/(near-far);return o}
function transformPt(m,p){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]}
function transformedNormal(m,n){return norm([m[0]*n[0]+m[4]*n[1]+m[8]*n[2],m[1]*n[0]+m[5]*n[1]+m[9]*n[2],m[2]*n[0]+m[6]*n[1]+m[10]*n[2]])}
function color(s){if(Array.isArray(s))return s;const v=parseInt(s.replace('#',''),16);return[(v>>16&255)/255,(v>>8&255)/255,(v&255)/255]}
const C={wood:'#bf7948',lightWood:'#e9b479',edge:'#714632',darkWood:'#76462d',metal:'#647785',lightMetal:'#a7b6b4',rust:'#aa5643',rustLight:'#d37c57',cream:'#f0e5ca',red:'#ca5441',white:'#f6ebd2',green:'#7aa444',dark:'#3d3440',black:'#322b2b',skin:'#eeb67b',skinDark:'#c9865a',shirt:'#c53d34',pants:'#4a73a0',blue:'#4680bd',yellow:'#dfb34c',rope:'#9f734b',glass:'#8eaeb1'};
function boxGeom(){let out=[];const f=[[[1,0,0],[[.5,-.5,-.5],[.5,-.5,.5],[.5,.5,.5],[.5,.5,-.5]]],[[-1,0,0],[[-.5,-.5,.5],[-.5,-.5,-.5],[-.5,.5,-.5],[-.5,.5,.5]]],[[0,1,0],[[-.5,.5,-.5],[.5,.5,-.5],[.5,.5,.5],[-.5,.5,.5]]],[[0,-1,0],[[-.5,-.5,.5],[.5,-.5,.5],[.5,-.5,-.5],[-.5,-.5,-.5]]],[[0,0,1],[[-.5,-.5,.5],[-.5,.5,.5],[.5,.5,.5],[.5,-.5,.5]]],[[0,0,-1],[[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,-.5]]]];for(const [n,q] of f)for(const i of [0,1,2,0,2,3])out.push(...q[i],...n);return out}
function cylinderGeom(segments=12){const d=[];for(let i=0;i<segments;i++){let a=i*PI*2/segments,b=(i+1)*PI*2/segments,ca=Math.cos(a)*.5,sa=Math.sin(a)*.5,cb=Math.cos(b)*.5,sb=Math.sin(b)*.5;for(const [x,y,z] of [[ca,-.5,sa],[cb,-.5,sb],[cb,.5,sb],[ca,-.5,sa],[cb,.5,sb],[ca,.5,sa]])d.push(x,y,z,Math.cos(Math.atan2(z,x)),0,Math.sin(Math.atan2(z,x)));for(const [v,w,t] of [[[0,.5,0],[ca,.5,sa],[cb,.5,sb]],[[0,-.5,0],[cb,-.5,sb],[ca,-.5,sa]]]){let n=t[1]>0?1:-1;for(const pt of [v,w,t])d.push(...pt,0,n,0)}}return d}
function sphereGeom(segments=12,rings=8){let d=[];function v(a,b){let t=Math.sin(a);return [t*Math.cos(b)*.5,Math.cos(a)*.5,t*Math.sin(b)*.5]}for(let i=0;i<rings;i++)for(let j=0;j<segments;j++){const a=i*PI/rings,b=j*2*PI/segments,a2=(i+1)*PI/rings,b2=(j+1)*2*PI/segments;const q=[v(a,b),v(a2,b),v(a2,b2),v(a,b2)];for(let k of [0,1,2,0,2,3]){const x=q[k];d.push(...x,...norm(x))}}return d}
function coneGeom(segments=10){const d=[];for(let j=0;j<segments;j++){const a=j*2*PI/segments,b=(j+1)*2*PI/segments,u=[Math.cos(a)*.5,-.5,Math.sin(a)*.5],v=[Math.cos(b)*.5,-.5,Math.sin(b)*.5],top=[0,.5,0],n=norm(cross(sub(v,u),sub(top,u)));for(const x of [u,v,top])d.push(...x,...n)}return d}
const meshes={box:boxGeom(),cyl:cylinderGeom(),sphere:sphereGeom(),cone:coneGeom()};
function bindVertices(data){if(software)return{buffer:null,count:data.length/9,data:new Float32Array(data)};let buff=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buff);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);for(const [l,off] of [[loc.p,0],[loc.n,3],[loc.c,6]]){gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,3,gl.FLOAT,false,36,off*4)}return{buffer:buff,count:data.length/9}}
function vertsFor(mesh,m,col){const a=meshes[mesh],v=[];let rgb=color(col);for(let i=0;i<a.length;i+=6){let pt=transformPt(m,a.slice(i,i+3)),nn=transformedNormal(m,a.slice(i+3,i+6));v.push(...pt,...nn,...rgb)}return v}
let stat=[];function fixed(mesh,x,y,z,sx,sy,sz,c,rot=0){stat.push(...vertsFor(mesh,model(x,y,z,sx,sy,sz,rot),c))}
let staticBuffer=null;
let softDynamic=[];function drawMesh(mesh,x,y,z,sx,sy,sz,c,rot=0){const data=vertsFor(mesh,model(x,y,z,sx,sy,sz,rot),c);if(software){softDynamic.push(data);return}gl.bindBuffer(gl.ARRAY_BUFFER,dynamicBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);for(const [l,off] of [[loc.p,0],[loc.n,3],[loc.c,6]]){gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,3,gl.FLOAT,false,36,off*4)}gl.uniformMatrix4fv(loc.m,false,identity);gl.drawArrays(gl.TRIANGLES,0,data.length/9)}
const identity=mat(),dynamicBuffer=gl.createBuffer();
const toWorldX=x=>(x-280)/90,toWorldY=y=>(1100-y)/90, pxWorld=w=>w*90+280, pyWorld=w=>1100-w*90;
const solids=[[0,1100,560,240,'floor'],[-12,-545,23,1670,'wall'],[547,-545,23,1670,'wall'],[170,1013,134,27,'wood'],[356,935,160,25,'metal'],[302,851,139,23,'wood'],[116,766,135,25,'fridge'],[18,671,140,26,'metal'],[188,590,133,25,'wood'],[354,508,143,23,'barrel'],[327,425,103,24,'wood'],[133,345,139,24,'metal'],[275,250,131,24,'fridge'],[411,174,119,24,'wood'],[282,79,133,25,'metal'],[119,-28,136,27,'wood'],[31,-133,130,26,'fridge'],[207,-217,131,26,'metal'],[364,-308,135,27,'wood'],[245,-413,174,30,'finish']].map(([x,y,w,h,type])=>({x,y,w,h,type}));
const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
function beamBetween(ax,ay,az,bx,by,bz,r,c){const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy);fixed('box',(ax+bx)/2,(ay+by)/2,(az+bz)/2,r,len,r,c,Math.atan2(-dx,dy))}
function woodPlank(x,y,z,sx,sy,sz,idx){fixed('box',x,y,z,sx,sy,sz,idx%3===0?C.lightWood:C.wood);fixed('box',x,y-sy*.45,z+sz*.5+.006,sx,Math.min(.025,sy*.12),.022,C.edge)}
function createScenery(){
 // ground and distant skyline in genuine perspective depth
 fixed('box',0,-4,-3,28,8,6,'#ab845d');
 for(let i=0;i<48;i++){let x=-20+i*.87+hash(i)*.22,y=1.1+hash(i*7)*5.8;fixed('box',x,y/2-1,-16-hash(i*3)*8,.52+hash(i*21)*1.1,y+2,.8,i%3?'#a3a1a1':'#c0a48f');}
 for(let i=0;i<65;i++){let x=-14+hash(i*11)*28,y=-1+hash(i*17)*17,z=-20-hash(i*13)*10;fixed('sphere',x,y,z,1+hash(i*3)*1.6,.65+hash(i*5),.85,'#f5f6ef')}
 // mast structure behind platforms, slanted supports
 for(let j=0;j<20;j++){let y=(j*.95)-.8;for(let side of [-1,1]){fixed('box',side*(2.7+Math.sin(j*2)*.10),y,-1.55,.14,1.85,.19,C.wood);if(j%2===0){fixed('box',side*(2.7),y+.85,-1.5,.24,.10,.2,C.metal)} }if(j<18){fixed('box',0,y+.12,-1.8,5.6,.12,.22,j%3===0?C.wood:C.darkWood);if(j%3===0)beamBetween(-2.5,y-.4,-1.8,2.5,y+1.24,-1.8,.13,C.edge)}}
 // Structural depth: rear platforms + rails
 for(let i=0;i<22;i++){let y=.3+i*.79,x=((i*19)%7-3)*.82;fixed('box',x,y,-2.8,1.25,.13,1.2,C.wood);fixed('box',x-.58,y+.33,-2.4,.10,.67,.12,C.lightWood);fixed('box',x+.58,y+.33,-2.4,.10,.67,.12,C.lightWood);fixed('box',x,y+.6,-2.42,1.2,.09,.10,C.edge);}
 for(let i=0;i<solids.length;i++){const b=solids[i];if(b.type==='wall')continue;if(b.type==='floor')continue;const x=toWorldX(b.x+b.w/2),y=toWorldY(b.y+b.h/2),w=b.w/90,h=b.h/90;
  if(b.type==='wood'||b.type==='finish'){
    fixed('box',x,y,-.48,w,h,.87,i%2?C.wood:C.lightWood);
    for(let k=0;k<4;k++){fixed('box',x-w*.5+(k+.5)*w/4,y+h*.51,-.45,w/4-.022,.044,.94,k%2?C.lightWood:C.wood)}
    for(let k=0;k<3;k++){let dx=x-w*.5+(k+.5)*w/3;fixed('cyl',dx,y+h*.54,.01,.045,.014,.045,C.metal)}
  }else if(b.type==='metal'){fixed('box',x,y,-.46,w,h,.96,C.metal);fixed('box',x,y+h*.30,.05,w-.09,.04,.10,C.lightMetal);for(let k=0;k<4;k++)fixed('cyl',x-w/2+(k+.5)*w/4,y+h*.5,.04,.04,.02,.04,C.dark)}
  else if(b.type==='fridge'){fixed('box',x,y,-.45,w,h,.98,C.cream);fixed('box',x,y+h*.15,.052,w-.08,h*.62,.06,'#d1c9b8');fixed('box',x+w*.29,y+h*.08,.086,.044,h*.34,.055,C.metal);fixed('box',x-w*.2,y+h*.17,.1,.22,.14,.06,C.green)}
  else if(b.type==='barrel'){fixed('box',x,y,-.46,w,h,.83,C.rust);for(let j=-1;j<=1;j++)fixed('box',x+j*w*.25,y,.03,w*.12,h*.95,.05,C.cream);}
  for(let z of [-.86,-.05]){fixed('box',x-w*.32,y-h*.5-.18,z,.13,.38,.15,C.edge);fixed('box',x+w*.3,y-h*.5-.18,z,.13,.38,.15,C.edge)}
 }
 // decorative rusty barrels, wood crates, tires, signs and traffic cones—depth is real
 for(let i=0;i<21;i++){let x=toWorldX(70+((i*137)%420)),y=toWorldY(1010-i*72)+.27,z=-1.3-i%3*.42;
   if(i%4===0){fixed('cyl',x,y,z,.55,.60,.55,C.rust);fixed('cyl',x,y+.28,z,.56,.06,.56,C.metal);fixed('cyl',x,y-.28,z,.56,.06,.56,C.metal);}
   else if(i%4===1){fixed('box',x,y,z,.85,.65,.72,C.wood);fixed('box',x,y,z+.37,.12,.65,.055,C.edge);fixed('box',x,y,z+.37,.82,.12,.055,C.edge);}
   else if(i%4===2){fixed('cone',x,y+.19,z,.38,.67,.38,'#e36c3d');fixed('box',x,y-.07,z+.26,.24,.07,.04,C.cream);}
   else{fixed('cyl',x,y,z,.57,.17,.57,C.dark);fixed('cyl',x,y,z+.16,.25,.18,.25,C.metal)}
 }
 // signs and banners on rear beams
 for(let i=0;i<6;i++){let y=2+i*2.6,x=i%2?-2.15:1.95;fixed('box',x,y,-1.2,1.35,.78,.05,i%2?'#ba543c':'#d6b252');fixed('box',x,y+.33,-1.13,1.48,.08,.10,C.edge)}
 // suspended ropes and hanging buckets
 for(let i=0;i<9;i++){let x=-2.45+(i*7%12)*.4,y=1.1+i*1.95;fixed('cyl',x,y,-.55,.028,.9,.028,C.rope);fixed('cyl',x,y-.48,-.55,.23,.29,.23,C.metal)}
 // finish podium and checkerboard flag, important goal
 fixed('cyl',0,17.35,-.35,.06,2.1,.06,C.edge);
 for(let i=0;i<16;i++){let r=Math.floor(i/4),c=i%4;fixed('box',.12+c*.22,18.25-r*.21,-.31,.22,.21,.03,(r+c)%2===0?C.black:C.cream)}
 // clouds closer than the skyline but behind the tower
 for(let i=0;i<18;i++){let x=-10+hash(i*15)*20,y=1+hash(i*20)*22,z=-13-hash(i*24)*2;for(let k=0;k<4;k++)fixed('sphere',x+(k-1.5)*.52,y+Math.sin(k)*.2,z,1.1,.65,1,C.white)}
 staticBuffer=bindVertices(stat);stat=[];
}
createScenery();
const read=(key,f)=>{try{return localStorage.getItem(key)??f}catch{return f}},write=(key,v)=>{try{localStorage.setItem(key,v)}catch{}};
let best=Number(read('higherfools-best-v03','0'))||0,sens=+read('higherfools-sens-v03','100'),quality=read('higherfools-quality-v03','high');$('best').textContent=best.toFixed(1).replace('.',',')+' m';$('sensitivity').value=sens;$('quality').value=quality;
$('sensitivity').oninput=e=>{sens=+e.target.value;write('higherfools-sens-v03',sens)};$('quality').onchange=e=>{quality=e.target.value;write('higherfools-quality-v03',quality);resize()};
let mode='menu',pointer=null,pausedAt=0,prev=performance.now(),acc=0,camHeight=5.9,camX=0,viewProj=mat(),size=[390,844],lastImpact=0;
const p={x:95,y:1068,vx:0,vy:0,r:23,angle:-PI/4,target:-PI/4,length:98,targetLength:98,angular:0,contact:false};
function restart(){Object.assign(p,{x:95,y:1068,vx:0,vy:0,r:23,angle:-PI/4,target:-PI/4,length:98,targetLength:98,angular:0,contact:false});camHeight=3.5;camX=0;acc=0;lastImpact=0;}
function start(){if(mode==='menu'||mode==='won')restart();mode='playing';$('menu').style.display='none';$('hud').hidden=false;$('play').textContent='CONTINUAR';$('contact').textContent=''}
function pause(){if(mode!=='playing')return;mode='paused';$('menu').style.display='flex';$('hud').hidden=true;$('play').innerHTML='CONTINUAR A SUBIR <span>➜</span>'}
function won(){mode='won';$('menu').style.display='flex';$('hud').hidden=true;$('play').innerHTML='TENTAR DE NOVO <span>➜</span>';}
$('play').onclick=start;$('pause').onclick=pause;$('restart').onclick=()=>{restart();start()};
function resize(){let dpr=quality==='low'?Math.min(devicePixelRatio||1,1):Math.min(devicePixelRatio||1,1.6);let w=canvas.clientWidth||window.innerWidth,h=canvas.clientHeight||window.innerHeight;canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);gl.viewport(0,0,canvas.width,canvas.height);size=[w,h]}
window.addEventListener('resize',resize);resize();
function hitCircleBox(cx,cy,r,b){const qx=clamp(cx,b.x,b.x+b.w),qy=clamp(cy,b.y,b.y+b.h),dx=cx-qx,dy=cy-qy,d2=dx*dx+dy*dy;if(d2>=r*r)return null;let dist=Math.sqrt(d2);if(dist>.00001)return{nx:dx/dist,ny:dy/dist,pen:r-dist};let list=[[Math.abs(cx-b.x),-1,0],[Math.abs(cx-b.x-b.w),1,0],[Math.abs(cy-b.y),0,-1],[Math.abs(cy-b.y-b.h),0,1]].sort((a,b)=>a[0]-b[0]);return{nx:list[0][1],ny:list[0][2],pen:r+list[0][0]}}
function physicsStep(dt){p.contact=false;let da=Math.atan2(Math.sin(p.target-p.angle),Math.cos(p.target-p.angle));p.angular=clamp(da*17*sens/100,-11*sens/100,11*sens/100);p.angle+=p.angular*dt;p.length=lerp(p.length,p.targetLength,Math.min(1,dt*8));p.vy+=840*dt;p.vx*=.999;p.vx=clamp(p.vx,-850,850);p.vy=clamp(p.vy,-900,900);p.x+=p.vx*dt;p.y+=p.vy*dt;
 for(let j=0;j<3;j++){
  let tx=p.x+Math.cos(p.angle)*p.length,ty=p.y+Math.sin(p.angle)*p.length;
  for(const b of solids){if(tx+13<b.x||tx-13>b.x+b.w||ty+13<b.y||ty-13>b.y+b.h)continue;const c=hitCircleBox(tx,ty,12,b);if(!c)continue;p.contact=true;p.x+=c.nx*c.pen*.81;p.y+=c.ny*c.pen*.81;const vx=p.vx-Math.sin(p.angle)*p.length*p.angular,vy=p.vy+Math.cos(p.angle)*p.length*p.angular,vin=Math.max(0,-(vx*c.nx+vy*c.ny));if(vin>0){let impulse=Math.min(470,vin*.7);p.vx+=c.nx*impulse;p.vy+=c.ny*impulse;}}
  for(const b of solids){if(p.x+p.r<b.x||p.x-p.r>b.x+b.w||p.y+p.r<b.y||p.y-p.r>b.y+b.h)continue;const c=hitCircleBox(p.x,p.y,p.r,b);if(!c)continue;p.x+=c.nx*c.pen;p.y+=c.ny*c.pen;let vn=p.vx*c.nx+p.vy*c.ny;if(vn<0){p.vx-=1.03*vn*c.nx;p.vy-=1.03*vn*c.ny;if(c.ny<-.4)p.vx*=.975;}}
 }
 if(p.y>1076){p.y=1076;p.vy=Math.min(0,p.vy)}
 const h=Math.max(0,(1078-p.y)/90);if(h>best+.02){best=h;write('higherfools-best-v03',best.toFixed(2));}
 $('height').textContent=h.toFixed(1).replace('.',',')+' m';$('best').textContent=best.toFixed(1).replace('.',',')+' m';
 if(p.y<-455) {mode='won';$('menu').style.display='flex';$('hud').hidden=true;$('play').innerHTML='JOGAR DE NOVO <span>➜</span>';}
}
function project(pt){const m=viewProj,p4=[m[0]*pt[0]+m[4]*pt[1]+m[8]*pt[2]+m[12],m[1]*pt[0]+m[5]*pt[1]+m[9]*pt[2]+m[13],m[3]*pt[0]+m[7]*pt[1]+m[11]*pt[2]+m[15]];if(p4[2]<=.001)return [size[0]/2,size[1]/2];return [(p4[0]/p4[2]+1)*size[0]/2,(1-p4[1]/p4[2])*size[1]/2]}
function aim(ev){const pos=project([toWorldX(p.x),toWorldY(p.y),.35]),dx=ev.clientX-pos[0],dy=ev.clientY-pos[1];if(Math.hypot(dx,dy)<12)return;p.target=Math.atan2(dy,dx);p.targetLength=clamp(Math.hypot(dx,dy)*.9,76,115)}
canvas.addEventListener('pointerdown',e=>{if(mode!=='playing')return;pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);aim(e);$('touchhint').style.opacity='.45'});
canvas.addEventListener('pointermove',e=>{if(mode!=='playing')return;if(e.pointerType==='mouse'||pointer===e.pointerId)aim(e)});
for(const t of ['pointerup','pointercancel'])canvas.addEventListener(t,e=>{if(e.pointerId===pointer){pointer=null;$('touchhint').style.opacity='1'}});
window.addEventListener('keydown',e=>{if(e.code==='Space'||e.key==='Escape'||e.key.toLowerCase()==='p'){mode==='playing'?pause():mode==='paused'?start():null}if(e.key.toLowerCase()==='r'){restart();if(mode!=='playing')start()}if(mode==='playing'&&e.key==='ArrowLeft')p.target-=.22;if(mode==='playing'&&e.key==='ArrowRight')p.target+=.22});
function segment(ax,ay,az,bx,by,bz,r,col){const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy);drawMesh('cyl',(ax+bx)/2,(ay+by)/2,(az+bz)/2,r,L,r,col,Math.atan2(-dx,dy))}
function hero(){let x=toWorldX(p.x),y=toWorldY(p.y)+.57,z=.46;const tilt=clamp(p.vx/1700,-.15,.15);
 drawMesh('box',x,y-.17,z,.43,.53,.35,C.shirt,tilt);
 drawMesh('box',x,y-.46,z,.39,.14,.35,C.pants,tilt);
 drawMesh('box',x-.16,y-.68,z+.02,.16,.30,.21,C.skinDark,tilt+.10);
 drawMesh('box',x+.16,y-.68,z+.02,.16,.30,.21,C.skin,tilt-.10);
 drawMesh('box',x-.16,y-.82,z+.075,.24,.12,.33,C.edge);
 drawMesh('box',x+.16,y-.82,z+.075,.24,.12,.33,C.edge);
 drawMesh('box',x,y+.28,z,.75,.74,.64,C.skin,tilt*.5);
 drawMesh('box',x+.26,y+.16,z+.33,.26,.16,.06,C.skinDark,tilt*.5);
 drawMesh('sphere',x-.195,y+.36,z+.342,.27,.28,.24,C.white);
 drawMesh('sphere',x+.20,y+.36,z+.342,.27,.28,.24,C.white);
 drawMesh('sphere',x-.12,y+.34,z+.468,.105,.12,.12,C.black);
 drawMesh('sphere',x+.275,y+.34,z+.468,.105,.12,.12,C.black);
 drawMesh('box',x+.035,y+.055,z+.346,.25,.065,.037,C.dark);
 drawMesh('box',x+.035,y+.012,z+.36,.11,.04,.04,C.rustLight);
 drawMesh('box',x-.34,y-.18,z-.03,.19,.32,.20,C.skin,tilt-.20);
 drawMesh('box',x+.36,y-.16,z-.01,.18,.32,.18,C.skin,tilt+.13);
 const L=p.length/90,dx=Math.cos(p.angle)*L,dy=-Math.sin(p.angle)*L;
 const ax=x+.08,ay=y-.57,bx=x+dx,by=y-.57+dy;
 segment(ax,ay,z+.30,bx,by,z+.30,.094,C.wood);
 segment(ax,ay,z+.30,bx,by,z+.30,.045,C.lightWood);
 drawMesh('box',bx,by,z+.30,.65,.26,.38,C.metal,-p.angle-PI/2);
 drawMesh('box',bx,by,z+.50,.55,.10,.055,C.lightMetal,-p.angle-PI/2);
 if(p.contact){drawMesh('sphere',bx,by,z+.08,.22,.18,.16,C.yellow)}
}

let lastSoftwareFrame=0;
function softwareFrame(vp){
 const t=performance.now();if(t-lastSoftwareFrame<85)return;lastSoftwareFrame=t;
 const ww=size[0],hh=size[1];soft.clearRect(0,0,ww,hh);
 const triangles=[];
 function collect(a,stride=9){
  for(let i=0;i+stride*3<=a.length;i+=stride*3){
    let positions=[],depth=0,visible=true,normal=[a[i+3],a[i+4],a[i+5]];
    for(let k=0;k<3;k++){
      const o=i+k*stride,x=a[o],y=a[o+1],z=a[o+2];
      let cx=vp[0]*x+vp[4]*y+vp[8]*z+vp[12],cy=vp[1]*x+vp[5]*y+vp[9]*z+vp[13],cz=vp[2]*x+vp[6]*y+vp[10]*z+vp[14],cw=vp[3]*x+vp[7]*y+vp[11]*z+vp[15];
      if(cw<=.02){visible=false;break;}
      positions.push((cx/cw+1)*ww*.5,(1-cy/cw)*hh*.5);depth+=cz/cw;
    }
    if(!visible||Math.max(positions[0],positions[2],positions[4])<0||Math.min(positions[0],positions[2],positions[4])>ww||Math.max(positions[1],positions[3],positions[5])<0||Math.min(positions[1],positions[3],positions[5])>hh)continue;
    const light=Math.max(0,(-.5*normal[0]+.87*normal[1]+.8*normal[2])/1.28),mul=.66+light*.41;
    let r=Math.round(clamp(a[i+6]*mul*255,0,255)),g=Math.round(clamp(a[i+7]*mul*255,0,255)),b=Math.round(clamp(a[i+8]*mul*255,0,255));
    triangles.push([depth/3,positions,`rgb(${r},${g},${b})`]);
  }
 }
 collect(staticBuffer.data);for(const dyn of softDynamic)collect(dyn);
 triangles.sort((a,b)=>b[0]-a[0]);
 for(const [dep,v,col] of triangles){soft.beginPath();soft.moveTo(v[0],v[1]);soft.lineTo(v[2],v[3]);soft.lineTo(v[4],v[5]);soft.closePath();soft.fillStyle=col;soft.fill();}
}

function render(time){let now=time*.001,dt=Math.min(.045,(time-prev)/1000||.016);prev=time;
 if(mode==='playing'){acc=Math.min(acc+dt,.07);for(let i=0;acc>=1/120&&i<10;i++,acc-=1/120)physicsStep(1/120)}
 let py=toWorldY(p.y);let desired=clamp(py+3.1,3.4,18);if(mode==='menu')desired=6.1;if(mode==='paused')desired=clamp(py+4.2,5.2,19);camHeight=lerp(camHeight,desired,Math.min(1,dt*2.4));camX=lerp(camX,clamp(toWorldX(p.x)*.32,-.45,.45),Math.min(1,dt*2.5));
 const eye=[camX+2.3,camHeight+2.8,17.3],target=[camX,camHeight,0],vp=mul(perspective(PI/3.04,size[0]/Math.max(1,size[1]),.07,120),lookAt(eye,target,[0,1,0]));viewProj=vp;
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniformMatrix4fv(loc.vp,false,vp);gl.uniformMatrix4fv(loc.m,false,identity);
 if(software){softDynamic=[];hero();softwareFrame(vp);requestAnimationFrame(render);return;}gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer.buffer);for(const [l,off] of [[loc.p,0],[loc.n,3],[loc.c,6]]){gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,3,gl.FLOAT,false,36,off*4)}gl.drawArrays(gl.TRIANGLES,0,staticBuffer.count);
 hero();requestAnimationFrame(render)
}
restart();requestAnimationFrame(render);
window.__HF_TEST__={get:()=>({mode,position:{x:p.x,y:p.y},height:Math.max(0,(1078-p.y)/90),best,contact:p.contact,webgl:!software,renderer:software?'software-3d':'webgl-3d',triangles:staticBuffer.count/3,screen:size}),setAngle:a=>{p.angle=a;p.target=a},step:n=>{for(let i=0;i<n;i++)physicsStep(1/120)}};
})();