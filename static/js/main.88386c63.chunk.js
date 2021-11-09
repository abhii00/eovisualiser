(this.webpackJsonpeovisualiser=this.webpackJsonpeovisualiser||[]).push([[0],{24:function(t,e,n){},25:function(t,e,n){"use strict";n.r(e);var a=n(16),i=n.n(a),s=n(8),r=n(0),o=n(1),c=n(2),h=n(3),u=n(11),d=n.n(u),l=n(5),p=n(17),w=n(10);function v(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:new Date,n=e/864e5-e.getTimezoneOffset()/1440+2440587.5;switch(t){case"julian":return n;case"j2000":return n-2451545;case"gmst":return w.b(e);default:return e}}function f(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:v("j2000");return(23.439-4e-7*t)*Math.PI/180}function m(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:v("j2000"),e=280.46+.9856474*t,n=357.528+.9856003*t,a=f(t);n=n%360*Math.PI/180;var i=e+1.915*Math.sin(n)+.02*Math.sin(2*n);i=i*Math.PI/180;var s=Math.atan2(Math.cos(a)*Math.sin(i),Math.cos(i)),r=Math.asin(Math.sin(a)*Math.sin(i));return[s,r]}var M=n.p+"static/media/earth_2k.981cc3e3.jpg";function j(t,e,n){var a=new l.p(1,60,60),i=new l.i({color:0,side:l.a}),r=new l.h(a,i);r.scale.set(100,100,100),t.add(r);var o=80,c=function(){var t=m(arguments.length>0&&void 0!==arguments[0]?arguments[0]:v("j2000")),e=Object(s.a)(t,2),n=e[0],a=e[1],i=Math.cos(a)*Math.cos(n),r=Math.cos(a)*Math.sin(n),o=Math.sin(a);return[i,r,o]}(),h=Object(s.a)(c,3),u=h[0],d=h[1],p=h[2],w=new l.m(16777215,1);w.position.set(o*u,o*p,o*d),t.add(w);var f=new l.i,j=new l.h(a,f);j.scale.set(2,2,2),j.position.set(o*u,o*p,o*d),t.add(j);var y=[];y.push(new l.u(0,0,0)),y.push(j.position);var g=(new l.b).setFromPoints(y),O=new l.f,_=new l.e(g,O);t.add(_);var k=new l.j({map:b(M),metalness:.4,roughness:.8}),x=new l.h(a,k);x.rotation.set(0,function(){return-(arguments.length>0&&void 0!==arguments[0]?arguments[0]:v("gmst"))-Math.PI/2}(),0),t.add(x),function a(){requestAnimationFrame(a),n.render(t,e)}()}function b(t){return(new l.s).load(t)}var y=n(12),g=function(){function t(e,n,a,i,s,o){switch(Object(r.a)(this,t),this.raw_data=n,this.scale_factor=a,this.datapoints=[],this.scene=i,this.camera=s,this.renderer=o,this.sphere_geometry=new l.p(.01,2,2),this.sphere_material=new l.i,this.type=e,this.type){case"satellite-tle":this.processTLEData(),this.renderECIDataPoints()}}return Object(o.a)(t,[{key:"processTLEData",value:function(){for(var t=this.raw_data.split(/\r?\n/),e=new Date,n=0;n<(t.length-1)/3;n++){var a=3*n,i=w.d(t[a+1],t[a+2]),s=w.c(i,e);if(void 0!==s.position){var r=s.position,o=new l.u(r.x,r.z,r.y);o.multiplyScalar(this.scale_factor);var c=w.a(r,v("gmst")),h=new l.u(c.x,c.z,c.y);h.multiplyScalar(this.scale_factor);var u=new l.h(this.sphere_geometry,this.sphere_material.clone());u.position.copy(o),Math.abs(h.x)<.05?u.material.color=new l.c(16711680):Math.abs(h.y)<.05?u.material.color=new l.c(65280):u.material.color=new l.c(16777215);var d=new O(t[a],u);this.datapoints.push(d)}}}},{key:"renderECIDataPoints",value:function(){var t,e=Object(y.a)(this.datapoints);try{for(e.s();!(t=e.n()).done;){var n=t.value;this.scene.add(n.mesh)}}catch(a){e.e(a)}finally{e.f()}}}]),t}(),O=function t(e,n){Object(r.a)(this,t),this.id=e,this.mesh=n},_=n.p+"static/media/test.73eab6d5.txt",k=n(13),x=function(t){Object(c.a)(n,t);var e=Object(h.a)(n);function n(){return Object(r.a)(this,n),e.apply(this,arguments)}return Object(o.a)(n,[{key:"componentDidMount",value:function(){var t=function(t){var e=new l.o,n=new l.l(75,window.innerWidth/window.innerHeight,.1);n.position.copy(t);var a=new l.v;return a.setSize(window.innerWidth,window.innerHeight),a.shadowMap.enabled=!0,a.shadowMap.type=l.k,new p.a(n,a.domElement).update(),[e,n,a]}(new l.u(0,0,3)),e=Object(s.a)(t,3),n=e[0],a=e[1],i=e[2];this.mount.appendChild(i.domElement),j(n,a,i),fetch(_).then((function(t){return t.text()})).then((function(t){return new g("satellite-tle",t,1/6378,n,a,i)}))}},{key:"render",value:function(){var t=this;return Object(k.jsx)("div",{className:"app",ref:function(e){return t.mount=e}})}}]),n}(d.a.Component);n(24);i.a.render(Object(k.jsx)(x,{}),document.getElementById("root"))}},[[25,1,2]]]);
//# sourceMappingURL=main.88386c63.chunk.js.map