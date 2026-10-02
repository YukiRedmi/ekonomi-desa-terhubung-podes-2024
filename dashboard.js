
(async () => {
'use strict';
const [R,G,M]=await Promise.all([fetch('data/dashboard_records.json').then(r=>r.json()),fetch('data/dashboard_geo.geojson').then(r=>r.json()),fetch('data/dashboard_meta.json').then(r=>r.json())]);
const COLORS={c1:'#0072B2',c2:'#E69F00',c3:'#009E73',outlier:'#CC79A7',accent:'#2563EB',teal:'#0F766E',amber:'#D97706',na:'#CBD5E1',text:'#172033',muted:'#64748B',border:'#E2E8F0'};
const CIV=['#00204C','#414D6B','#7C7B78','#B8AE6A','#FFE945'];
const HEAT=[[0,'#3B6FB6'],[.5,'#F8FAFC'],[1,'#D55E00']];
const fmt1=x=>x==null||!isFinite(x)?'NA':new Intl.NumberFormat('id-ID',{minimumFractionDigits:1,maximumFractionDigits:1}).format(x);
const fmt0=x=>x==null||!isFinite(x)?'NA':new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(x);
const pct=x=>x==null||!isFinite(x)?'NA':fmt1(x)+'%';
const byKey=new Map(R.map(r=>[r.wilayah_key,r]));
const state={page:'overview',province:'ALL',region:'ALL',indicator:'pct_4g5g',cluster:'ALL',outlierOnly:false,selectedKeys:[],selectedRegion:null,mapType:'choropleth',classification:'jenks',basemap:'plain',clusterLayer:false,outlierLayer:true,hierarchyType:'treemap'};
const els=id=>document.getElementById(id);
const graphConfig={responsive:true,displaylogo:false,scrollZoom:true,modeBarButtonsToRemove:['autoScale2d','toggleSpikelines']};

function initControls(){
  const provs=[...new Set(R.map(r=>r.provinsi))].sort((a,b)=>a.localeCompare(b,'id'));
  els('provinceFilter').innerHTML='<option value="ALL">Indonesia</option>'+provs.map(p=>`<option>${p}</option>`).join('');
  els('indicatorFilter').innerHTML=M.vars.map(v=>`<option value="${v}" ${v==='pct_4g5g'?'selected':''}>${M.labels[v]}</option>`).join('');
  updateRegionOptions();
  const compareOpts='<option value="">Pilih wilayah…</option>'+R.slice().sort((a,b)=>(a.provinsi+a.kabupaten_kota).localeCompare(b.provinsi+b.kabupaten_kota,'id')).map(r=>`<option value="${r.wilayah_key}">${r.kabupaten_kota} — ${r.provinsi}</option>`).join('');
  ['compare1','compare2','compare3'].forEach(id=>els(id).innerHTML=compareOpts);
  const tableRows=M.vars.map(v=>`<tr><td><b>${M.labels[v]}</b></td><td>${M.definitions[v]}</td><td>Persen (%)</td></tr>`).join('');
  els('indicatorTable').innerHTML='<thead><tr><th>Indikator</th><th>Definisi</th><th>Unit</th></tr></thead><tbody>'+tableRows+'</tbody>';
}
function updateRegionOptions(){
  const subset=state.province==='ALL'?R:R.filter(r=>r.provinsi===state.province);
  els('regionFilter').innerHTML='<option value="ALL">Semua wilayah</option>'+subset.slice().sort((a,b)=>a.kabupaten_kota.localeCompare(b.kabupaten_kota,'id')).map(r=>`<option value="${r.wilayah_key}">${r.kabupaten_kota}</option>`).join('');
  if(state.region!=='ALL'&&!subset.some(r=>r.wilayah_key===state.region)){state.region='ALL';els('regionFilter').value='ALL'}
}
function filtered({completeOnly=false,ignoreSelection=false}={}){
  let x=R.filter(r=>state.province==='ALL'||r.provinsi===state.province);
  if(state.cluster!=='ALL') x=x.filter(r=>String(r.cluster)===state.cluster);
  if(state.outlierOnly) x=x.filter(r=>r.outlier_99==='YES');
  if(completeOnly) x=x.filter(r=>r.pca_complete_case==='YES');
  if(!ignoreSelection&&state.selectedKeys.length) {const s=new Set(state.selectedKeys);x=x.filter(r=>s.has(r.wilayah_key));}
  return x;
}
function weighted(sub,v){const valid=sub.filter(r=>r[v]!=null&&r.desa_kelurahan!=null);if(!valid.length)return null;const sw=valid.reduce((a,r)=>a+r.desa_kelurahan,0);return valid.reduce((a,r)=>a+r[v]*r.desa_kelurahan,0)/sw;}
function clusterColor(c){return c===1?COLORS.c1:c===2?COLORS.c2:c===3?COLORS.c3:COLORS.na}

function indicatorColor(v){
  if(v==='pct_bts'||v==='pct_4g5g')return COLORS.accent;
  if(v==='pct_public_transport')return COLORS.amber;
  return COLORS.teal;
}
function indicatorGroup(v){
  if(v==='pct_bts'||v==='pct_4g5g')return 'Konektivitas digital';
  if(v==='pct_public_transport')return 'Mobilitas';
  return 'Infrastruktur & aktivitas ekonomi';
}
function sourceTitle(){return state.province==='ALL'?'Indonesia':state.province}

function basemapConfig(view){
  if(state.basemap==='light') return {
    style:{
      version:8,
      sources:{},
      layers:[
        {
          id:'background',
          type:'background',
          paint:{'background-color':'#CFE8FF'}
        }
      ]
    },
    center:view.center,
    zoom:view.zoom
  };
  if(state.basemap==='satellite') return {style:'white-bg',center:view.center,zoom:view.zoom,layers:[{sourcetype:'raster',source:['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],below:'traces',opacity:1},{sourcetype:'raster',source:['https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],below:'traces',opacity:.72}]};
  return {style:'white-bg',center:view.center,zoom:view.zoom};
}
function setMapLegend(html){const el=els('mapLegend');if(el)el.innerHTML=html;}
function renderBasemapInfo(){
  const notes={plain:'Mode <b>Plain</b> menempatkan fokus utama pada warna indikator. Latar putih paling aman untuk pembacaan kelas dan perbandingan antarwilayah.',light:'Mode <b>Light</b> menggunakan kanvas biru muda yang bersih tanpa tile eksternal, sehingga tidak muncul watermark dan area laut/ruang kosong tidak lagi tampak putih.',satellite:'Mode <b>Satellite</b> menambahkan citra satelit pada area kosong sehingga peta terasa lebih berisi. Warna indikator tetap berada di lapisan teratas agar data tetap terbaca.'};
  els('mapBasemapInfo').innerHTML=`<div class="basemap-chip-row"><span class="basemap-chip ${state.basemap==='plain'?'active':''}"><span class="dot plain"></span>Plain</span><span class="basemap-chip ${state.basemap==='light'?'active':''}"><span class="dot light"></span>Light</span><span class="basemap-chip ${state.basemap==='satellite'?'active':''}"><span class="dot satellite"></span>Satellite</span></div><div class="map-basemap-copy">${notes[state.basemap]}</div>`;
}
function renderMapLegend(sub,br){
  const v=state.indicator,label=M.labels[v]; let html='';
  if(state.mapType==='choropleth'){
    if(state.clusterLayer){
      const counts={1:sub.filter(r=>r.cluster===1).length,2:sub.filter(r=>r.cluster===2).length,3:sub.filter(r=>r.cluster===3).length};
      html+=`<div class="legend-block"><div class="legend-block-title">Layer cluster</div><div class="legend-items"><div class="legend-item"><span class="legend-swatch" style="background:${COLORS.c1}"></span><span>C1 — relatif rendah (${fmt0(counts[1])} wilayah)</span></div><div class="legend-item"><span class="legend-swatch" style="background:${COLORS.c2}"></span><span>C2 — menengah / transisi (${fmt0(counts[2])} wilayah)</span></div><div class="legend-item"><span class="legend-swatch" style="background:${COLORS.c3}"></span><span>C3 — relatif tinggi (${fmt0(counts[3])} wilayah)</span></div></div></div>`;
    } else {
      const labels=br.slice(0,-1).map((x,i)=>`${fmt1(br[i])}–${fmt1(br[i+1])}%`);
      html+=`<div class="legend-block"><div class="legend-block-title">Skala warna · ${label}</div><div class="legend-items">${labels.map((txt,i)=>`<div class="legend-item"><span class="legend-swatch" style="background:${CIV[i]}"></span><span>${txt}</span></div>`).join('')}<div class="legend-item"><span class="legend-swatch" style="background:${COLORS.na}"></span><span>NA / data tidak tersedia</span></div></div></div>`;
    }
  } else {
    const cm=M.countMap[v]; const vals=sub.filter(r=>r[cm]!=null).map(r=>r[cm]).sort((a,b)=>a-b); const pick=q=>vals.length?vals[Math.max(0,Math.min(vals.length-1,Math.floor((vals.length-1)*q)))]:0; const svals=[pick(.2),pick(.55),pick(.9)].map(x=>Math.round(x||0)); const max=Math.max(1,...vals,1); const size=x=>5+27*Math.sqrt((x||0)/max);
    html+=`<div class="legend-block"><div class="legend-block-title">Ukuran simbol · ${label}</div><div class="symbol-legend">${svals.map(vv=>`<div class="symbol-marker-wrap"><span class="symbol-marker" style="width:${size(vv)}px;height:${size(vv)}px"></span><span>${fmt0(vv)}</span></div>`).join('')}</div><div class="symbol-note">Area lingkaran menunjukkan jumlah desa/kelurahan dengan indikator aktif. Warna simbol tetap sama; perbandingan utama dibaca dari ukuran simbol dan nilai pada tooltip.</div></div>`;
  }
  const extras=[]; if(state.outlierLayer) extras.push(`<div class="legend-item"><span class="legend-diamond"></span><span>Pencilan multivariat (99%)</span></div>`); if(state.selectedRegion||state.selectedKeys.length) extras.push(`<div class="legend-item"><span class="legend-line"></span><span>Wilayah terpilih</span></div>`); if(extras.length) html+=`<div class="legend-block"><div class="legend-block-title">Overlay</div><div class="legend-items">${extras.join('')}</div></div>`; setMapLegend(html);
}


function setInterpretation(id,text){
  const el=els(id);if(el)el.textContent=text;
}
function signedPP(x){
  if(x==null||!isFinite(x))return 'tidak dapat dibandingkan';
  if(Math.abs(x)<.05)return 'hampir sama';
  return (x>0?'+':'−')+fmt1(Math.abs(x))+' poin persentase';
}
function clusterSummary(rows){
  const counts=[1,2,3].map(c=>({c,n:rows.filter(r=>r.cluster===c).length}));
  counts.sort((a,b)=>b.n-a.n);return counts;
}
function rankIn(rows,v,key){
  const a=rows.filter(r=>r[v]!=null).slice().sort((x,y)=>y[v]-x[v]);
  const i=a.findIndex(r=>r.wilayah_key===key);
  return i<0?null:{rank:i+1,total:a.length};
}
function meanOf(rows,key){
  const a=rows.map(r=>r[key]).filter(v=>v!=null&&isFinite(v));
  return a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
}
function topBottom(rows,v,n=3){
  const a=rows.filter(r=>r[v]!=null).slice().sort((x,y)=>y[v]-x[v]);
  return {top:a.slice(0,n),bottom:a.slice(-n).reverse()};
}
function activeRowsForMultivariate(){
  let x=filtered({completeOnly:true,ignoreSelection:!state.selectedKeys.length});
  if(!x.length)x=filtered({completeOnly:true,ignoreSelection:true});
  return x;
}
function renderOverviewInterpretations(scope,stats,arr,completeScope,counts){
  const valid=arr.filter(d=>d.value!=null);
  if(valid.length){
    const hi=valid[valid.length-1],lo=valid[0],active=stats[state.indicator],nat=M.national[state.indicator];
    const diff=active!=null&&nat!=null?active-nat:null;
    let text=`Pada ${sourceTitle()}, ${hi.label} memiliki cakupan tertinggi (${pct(hi.value)}), sedangkan ${lo.label} terendah (${pct(lo.value)}). `;
    text+=state.province==='ALL'
      ?`Indikator yang sedang dipilih, ${M.labels[state.indicator]}, berada pada ${pct(active)}.`
      :`${M.labels[state.indicator]} berada pada ${pct(active)}, atau ${signedPP(diff)} dibanding agregat nasional (${pct(nat)}).`;
    setInterpretation('interpretOverviewProfile',text);
  }
  if(completeScope.length){
    const order=[1,2,3].map((c,i)=>({c,n:counts[i]})).sort((a,b)=>b.n-a.n);
    const d=order[0];
    let text=`Dari ${fmt0(completeScope.length)} wilayah dengan data lengkap pada cakupan ini, C${d.c} merupakan cluster terbesar (${fmt0(d.n)} wilayah; ${fmt1(d.n/completeScope.length*100)}%). `;
    text+=`Komposisi lengkapnya adalah C1 ${fmt0(counts[0])}, C2 ${fmt0(counts[1])}, dan C3 ${fmt0(counts[2])}.`;
    setInterpretation('interpretOverviewCluster',text);
  }else setInterpretation('interpretOverviewCluster','Tidak ada observasi lengkap PCA pada filter yang sedang aktif.');
}
function renderPCAInterpretation(){
  const base=filtered({completeOnly:true,ignoreSelection:true});
  if(state.selectedKeys.length){
    const s=new Set(state.selectedKeys),sel=base.filter(r=>s.has(r.wilayah_key));
    const m1=meanOf(sel,'PC1'),m2=meanOf(sel,'PC2'),cs=clusterSummary(sel),outs=sel.filter(r=>r.outlier_99==='YES').length;
    setInterpretation('interpretPCA',
      `Seleksi lasso memuat ${fmt0(sel.length)} wilayah. Rata-rata posisinya PC1 ${m1==null?'NA':(m1>=0?'+':'')+fmt1(m1)} dan PC2 ${m2==null?'NA':(m2>=0?'+':'')+fmt1(m2)}. ${cs.length&&cs[0].n?`C${cs[0].c} paling banyak (${cs[0].n} wilayah). `:''}${outs?`${outs} wilayah termasuk pencilan multivariat 99%.`:'Tidak ada pencilan 99% di dalam seleksi ini.'}`
    );return;
  }
  const r=state.selectedRegion?byKey.get(state.selectedRegion):null;
  if(r&&r.PC1!=null){
    const pc1=r.PC1>=0?'berada pada sisi positif PC1, sehingga profil gabungan indikatornya cenderung lebih tinggi pada dimensi konektivitas/infrastruktur relatif':'berada pada sisi negatif PC1, sehingga profil gabungan indikatornya cenderung lebih rendah pada dimensi konektivitas/infrastruktur relatif';
    const pc2=r.PC2>=0?'PC2 positif menunjukkan kecenderungan relatif ke 4G/5G, angkutan umum, dan KUR':'PC2 negatif menunjukkan kecenderungan relatif ke akses pasar, pasar permanen, dan akses bank';
    setInterpretation('interpretPCA',`${r.kabupaten_kota} ${pc1}. ${pc2}. Wilayah ini termasuk C${r.cluster} — ${r.cluster_label}${r.outlier_99==='YES'?', dan ditandai sebagai pencilan multivariat 99%':''}.`);
    return;
  }
  const cs=clusterSummary(base),outs=base.filter(r=>r.outlier_99==='YES').length;
  setInterpretation('interpretPCA',
    `PC1 menjelaskan ${(M.pca.explained[0]*100).toFixed(2)}% dan PC2 ${(M.pca.explained[1]*100).toFixed(2)}% variasi; keduanya merangkum ${((M.pca.explained[0]+M.pca.explained[1])*100).toFixed(2)}%. ${cs.length&&cs[0].n?`Pada filter aktif, C${cs[0].c} paling banyak (${cs[0].n} wilayah). `:''}${outs} wilayah ditandai sebagai pencilan multivariat 99%.`
  );
}
function renderClusterProfileInterpretation(){
  const v=state.indicator,label=M.labels[v];
  const vals=[1,2,3].map(c=>({c,val:M.clusterProfiles[String(c)][v]})).sort((a,b)=>b.val-a.val);
  const hi=vals[0],lo=vals[vals.length-1];
  setInterpretation('interpretClusterProfile',
    `Untuk ${label}, rata-rata tertinggi terdapat pada C${hi.c} (${pct(hi.val)}) dan terendah pada C${lo.c} (${pct(lo.val)}), dengan selisih ${fmt1(hi.val-lo.val)} poin persentase. Perbedaan tersebut digunakan untuk membaca karakter relatif tiap cluster, bukan untuk memberi peringkat pembangunan.`
  );
}
function renderParallelInterpretation(){
  const x=activeRowsForMultivariate();
  if(!x.length){setInterpretation('interpretParallel','Tidak ada observasi lengkap pada filter aktif.');return;}
  const r=state.selectedRegion?byKey.get(state.selectedRegion):null;
  if(r&&r.pca_complete_case==='YES'){
    const zs=M.vars.map(v=>({v,z:r[v+'_z']})).filter(d=>d.z!=null).sort((a,b)=>b.z-a.z);
    setInterpretation('interpretParallel',
      `${r.kabupaten_kota} paling menonjol ke atas pada ${M.labels[zs[0].v]} (z=${fmt1(zs[0].z)}) dan paling rendah secara relatif pada ${M.labels[zs[zs.length-1].v]} (z=${fmt1(zs[zs.length-1].z)}). Z-score menunjukkan posisi relatif terhadap distribusi 509 observasi lengkap.`
    );return;
  }
  const means=M.vars.map(v=>({v,z:meanOf(x,v+'_z')})).filter(d=>d.z!=null).sort((a,b)=>b.z-a.z);
  const prefix=state.selectedKeys.length?`Pada ${x.length} wilayah hasil seleksi PCA`:`Pada ${x.length} wilayah yang sedang tampil`;
  setInterpretation('interpretParallel',
    `${prefix}, rata-rata z-score tertinggi terdapat pada ${M.labels[means[0].v]} (${means[0].z>=0?'+':''}${fmt1(means[0].z)}) dan terendah pada ${M.labels[means[means.length-1].v]} (${means[means.length-1].z>=0?'+':''}${fmt1(means[means.length-1].z)}). Garis yang bergerak di atas atau di bawah nol menunjukkan indikator yang relatif tinggi atau rendah terhadap pola keseluruhan.`
  );
}
function renderHeatmapInterpretation(){
  const x=activeRowsForMultivariate(),v=state.indicator,zkey=v+'_z';
  if(!x.length){setInterpretation('interpretHeatmap','Tidak ada observasi lengkap pada filter aktif.');return;}
  const hi=x.filter(r=>r[zkey]>=1).length,lo=x.filter(r=>r[zkey]<=-1).length,mid=x.length-hi-lo;
  setInterpretation('interpretHeatmap',
    `Untuk ${M.labels[v]}, ${hi} wilayah berada setidaknya 1 simpangan baku di atas rata-rata, ${lo} wilayah setidaknya 1 simpangan baku di bawah rata-rata, dan ${mid} wilayah berada di antara keduanya. Warna oranye menunjukkan nilai relatif tinggi, sedangkan biru menunjukkan nilai relatif rendah.`
  );
}
function renderMapInterpretation(sub){
  const v=state.indicator,label=M.labels[v],r=state.selectedRegion?byKey.get(state.selectedRegion):null;
  if(r&&sub.some(x=>x.wilayah_key===r.wilayah_key)){
    const scope=state.province==='ALL'?R:R.filter(x=>x.provinsi===state.province);
    const rank=rankIn(scope,v,r.wilayah_key),nat=M.national[v],diff=r[v]!=null&&nat!=null?r[v]-nat:null;
    setInterpretation('interpretMap',
      `${r.kabupaten_kota} mencatat ${label} ${pct(r[v])}${diff==null?'':`, ${signedPP(diff)} dibanding nasional (${pct(nat)})`}${rank?`. Posisi wilayah ini ${rank.rank} dari ${rank.total} pada cakupan ${state.province==='ALL'?'Indonesia':state.province}`:''}. ${state.mapType==='choropleth'?'Warna polygon menunjukkan persentase.':'Ukuran simbol menunjukkan jumlah desa/kelurahan, sehingga besar simbol tidak selalu berarti persentasenya lebih tinggi.'}`
    );return;
  }
  const tb=topBottom(sub,v,3);
  if(!tb.top.length){setInterpretation('interpretMap','Tidak ada nilai yang tersedia untuk indikator dan filter ini.');return;}
  if(state.mapType==='choropleth'){
    setInterpretation('interpretMap',
      `Pada cakupan ${sourceTitle()}, nilai ${label} tertinggi terdapat di ${tb.top.map(x=>`${x.kabupaten_kota} (${pct(x[v])})`).join(', ')}. Nilai terendah terdapat di ${tb.bottom.map(x=>`${x.kabupaten_kota} (${pct(x[v])})`).join(', ')}. Choropleth dibaca sebagai persentase, bukan jumlah absolut.`
    );
  }else{
    const cm=M.countMap[v],countRows=sub.filter(r=>r[cm]!=null).slice().sort((a,b)=>b[cm]-a[cm]).slice(0,3);
    setInterpretation('interpretMap',
      `Pada proportional symbol, area lingkaran mengikuti jumlah desa/kelurahan. Jumlah terbesar untuk ${label} terdapat di ${countRows.map(x=>`${x.kabupaten_kota} (${fmt0(x[cm])})`).join(', ')}. Bandingkan ukuran simbol dengan persentase pada tooltip agar volume dan proporsi tidak tertukar.`
    );
  }
}
function renderHierarchyInterpretation(){
  const v=state.indicator,label=M.labels[v],r=state.selectedRegion?byKey.get(state.selectedRegion):null;
  if(r){
    const prov=R.filter(x=>x.provinsi===r.provinsi),provDesa=prov.reduce((s,x)=>s+x.desa_kelurahan,0),share=provDesa?r.desa_kelurahan/provDesa*100:null;
    setInterpretation('interpretHierarchy',
      `${r.kabupaten_kota} mencakup ${fmt0(r.desa_kelurahan)} desa/kelurahan atau ${fmt1(share)}% dari total desa/kelurahan di ${r.provinsi}. Nilai ${label}-nya ${pct(r[v])}. Pada visual ini, luas area menunjukkan banyaknya desa/kelurahan, sedangkan warna menunjukkan nilai indikator.`
    );return;
  }
  if(state.province!=='ALL'){
    const rows=R.filter(x=>x.provinsi===state.province),tb=topBottom(rows,v,1),big=rows.slice().sort((a,b)=>b.desa_kelurahan-a.desa_kelurahan)[0];
    setInterpretation('interpretHierarchy',
      `Di ${state.province}, ${tb.top[0].kabupaten_kota} memiliki ${label} tertinggi (${pct(tb.top[0][v])}), sedangkan ${tb.bottom[0].kabupaten_kota} terendah (${pct(tb.bottom[0][v])}). ${big.kabupaten_kota} memiliki jumlah desa/kelurahan terbesar (${fmt0(big.desa_kelurahan)}), sehingga areanya paling besar.`
    );return;
  }
  const provs=[...new Set(R.map(r=>r.provinsi))].map(p=>{
    const rows=R.filter(r=>r.provinsi===p);
    return {p,val:weighted(rows,v),desa:rows.reduce((s,r)=>s+r.desa_kelurahan,0)};
  }).filter(d=>d.val!=null).sort((a,b)=>b.val-a.val);
  const biggest=provs.slice().sort((a,b)=>b.desa-a.desa)[0];
  setInterpretation('interpretHierarchy',
    `Pada tingkat provinsi, ${provs[0].p} memiliki agregat tertimbang ${label} tertinggi (${pct(provs[0].val)}), sedangkan ${provs[provs.length-1].p} terendah (${pct(provs[provs.length-1].val)}). ${biggest.p} memiliki jumlah desa/kelurahan terbesar (${fmt0(biggest.desa)}), sehingga menempati area paling besar.`
  );
}
function renderDrawerInterpretation(r,prov){
  const diffs=M.vars.map(v=>({v,d:r[v]!=null&&M.national[v]!=null?r[v]-M.national[v]:null}))
    .filter(x=>x.d!=null).sort((a,b)=>b.d-a.d);
  if(!diffs.length){setInterpretation('interpretDrawer','Tidak ada nilai yang dapat dibandingkan dengan agregat nasional.');return;}
  const up=diffs[0],down=diffs[diffs.length-1],pv=weighted(prov,state.indicator),dv=r[state.indicator]!=null&&pv!=null?r[state.indicator]-pv:null;
  setInterpretation('interpretDrawer',
    `Dibanding agregat nasional, perbedaan positif terbesar ${r.kabupaten_kota} terdapat pada ${M.labels[up.v]} (${signedPP(up.d)}), sedangkan perbedaan terendah terdapat pada ${M.labels[down.v]} (${signedPP(down.d)}). Untuk indikator aktif ${M.labels[state.indicator]}, nilainya ${signedPP(dv)} dibanding agregat ${r.provinsi}.`
  );
}
function renderCompareInterpretation(){
  const keys=['compare1','compare2','compare3'].map(id=>els(id).value).filter(Boolean);
  const rows=[...new Set(keys)].map(k=>byKey.get(k)).filter(Boolean),v=state.indicator;
  if(!rows.length){setInterpretation('interpretCompare','Pilih dua atau tiga kabupaten/kota untuk membaca perbedaannya pada delapan indikator.');return;}
  if(rows.length===1){setInterpretation('interpretCompare',`${rows[0].kabupaten_kota} dipilih. Tambahkan wilayah lain agar perbandingan antarkabupaten/kota dapat dibaca langsung.`);return;}
  const vals=rows.filter(r=>r[v]!=null).slice().sort((a,b)=>b[v]-a[v]);
  const top=vals[0],bottom=vals[vals.length-1];
  setInterpretation('interpretCompare',
    `Untuk indikator aktif ${M.labels[v]}, ${top.kabupaten_kota} memiliki nilai tertinggi di antara wilayah yang dibandingkan (${pct(top[v])}), sedangkan ${bottom.kabupaten_kota} terendah (${pct(bottom[v])}); selisihnya ${fmt1(top[v]-bottom[v])} poin persentase. Gunakan batang lain untuk melihat apakah pola yang sama bertahan pada indikator berbeda.`
  );
}

function navTo(page){state.page=page;document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-btn').forEach(x=>x.classList.toggle('active',x.dataset.page===page));els('page-'+page).classList.add('active');renderCurrent();window.setTimeout(()=>{const id=page==='overview'?'overviewBar':page==='multivariate'?'pcaChart':page==='spatial'?'mapChart':page==='hierarchy'?'hierarchyChart':null;if(id&&els(id).data)Plotly.Plots.resize(els(id))},80)}

function renderOverview(){
  const scope=filtered({ignoreSelection:true});
  const stats={};M.vars.forEach(v=>stats[v]=weighted(scope,v));
  els('scopePill').textContent=sourceTitle();els('overviewChartTitle').textContent=state.province==='ALL'?'Profil indikator nasional':'Profil indikator · '+state.province;
  els('hero4g').textContent=pct(stats.pct_4g5g);els('hero4gLabel').textContent=(state.province==='ALL'?'desa/kelurahan memiliki 4G/5G secara nasional':'desa/kelurahan memiliki 4G/5G di '+state.province);
  els('kpiKab').textContent=fmt0(scope.length);els('kpiProv').textContent=state.province==='ALL'?M.totals.provinsi:'1';els('kpiDesa').textContent=fmt0(scope.reduce((a,r)=>a+r.desa_kelurahan,0));els('kpiPca').textContent=fmt0(scope.filter(r=>r.pca_complete_case==='YES').length);
  const arr=M.vars.map(v=>({v,label:M.labels[v],value:stats[v]})).sort((a,b)=>(a.value??-1)-(b.value??-1));
  const colors=arr.map(d=>indicatorColor(d.v));
  Plotly.react('overviewBar',[{type:'bar',orientation:'h',y:arr.map(d=>d.label),x:arr.map(d=>d.value),customdata:arr.map(d=>[indicatorGroup(d.v),d.v===state.indicator?'Indikator aktif':'']),marker:{color:colors,line:{color:arr.map(d=>d.v===state.indicator?'#10243E':'rgba(255,255,255,.8)'),width:arr.map(d=>d.v===state.indicator?1.7:.5)}},text:arr.map(d=>pct(d.value)),textposition:'outside',cliponaxis:false,hovertemplate:'<b>%{y}</b><br>%{customdata[0]}<br>%{x:.1f}%<br>%{customdata[1]}<extra></extra>'}],{margin:{l:120,r:55,t:12,b:35},xaxis:{title:'Persentase desa/kelurahan (%)',range:[0,105],gridcolor:'#EEF2F7',zeroline:false},yaxis:{automargin:true},paper_bgcolor:'white',plot_bgcolor:'white',font:{color:COLORS.text},showlegend:false},{...graphConfig,displayModeBar:false});
  const vals=arr.filter(d=>d.value!=null);const hi=vals[vals.length-1],lo=vals[0];
  const completeScope=scope.filter(r=>r.pca_complete_case==='YES');const counts=[1,2,3].map(c=>completeScope.filter(r=>r.cluster===c).length);const topC=counts.indexOf(Math.max(...counts))+1;
  const selected=stats[state.indicator], nat=M.national[state.indicator], diff=selected!=null&&nat!=null?selected-nat:null;
  let cards=[
    ['01','Cakupan tertinggi',`Pada ${sourceTitle()}, ${M.labels[hi.v]} mencatat cakupan tertinggi (${pct(hi.value)}).`],
    ['02','Cakupan terendah',`Pada ${sourceTitle()}, ${M.labels[lo.v]} mencatat cakupan terendah (${pct(lo.value)}).`],
    ['03','Struktur multivariat', state.province==='ALL'?`Dalam hasil clustering, C${topC} memuat wilayah terbanyak: ${counts[topC-1]} dari ${completeScope.length} observasi lengkap.`:`${M.labels[state.indicator]} ${diff==null?'belum dapat dibandingkan dengan nasional':(diff>=0?'lebih tinggi ':'lebih rendah ')+fmt1(Math.abs(diff))+' poin persentase dibanding agregat nasional.'}`]
  ];
  els('insightCards').innerHTML=cards.map(c=>`<div class="insight"><div class="num">${c[0]}</div><strong>${c[1]}</strong><p>${c[2]}</p></div>`).join('');
  Plotly.react('overviewCluster',[{type:'bar',x:['C1','C2','C3'],y:counts,marker:{color:[COLORS.c1,COLORS.c2,COLORS.c3]},text:counts,textposition:'outside',hovertemplate:'%{x}: %{y} wilayah<extra></extra>'}],{margin:{l:40,r:10,t:15,b:35},yaxis:{gridcolor:'#EEF2F7',rangemode:'tozero'},paper_bgcolor:'white',plot_bgcolor:'white',font:{color:COLORS.text},showlegend:false},{...graphConfig,displayModeBar:false});
  renderOverviewInterpretations(scope,stats,arr,completeScope,counts);
}

function renderPCA(){
  const base=filtered({completeOnly:true,ignoreSelection:true});
  const traces=[1,2,3].map(c=>{const a=base.filter(r=>r.cluster===c);return {type:'scattergl',mode:'markers',name:'C'+c,customdata:a.map(r=>[r.wilayah_key,r.kabupaten_kota,r.provinsi,r.cluster_label,r.outlier_99]),x:a.map(r=>r.PC1),y:a.map(r=>r.PC2),marker:{size:a.map(r=>r.outlier_99==='YES'?10:7),color:clusterColor(c),opacity:.72,line:{color:a.map(r=>r.outlier_99==='YES'?COLORS.outlier:'#FFFFFF'),width:a.map(r=>r.outlier_99==='YES'?2.5:.6)},symbol:a.map(r=>r.outlier_99==='YES'?'diamond':'circle')},selected:{marker:{opacity:1,size:11,line:{color:'#172033',width:2}}},unselected:{marker:{opacity:.12}},hovertemplate:'<b>%{customdata[1]}</b><br>%{customdata[2]}<br>%{customdata[3]}<br>PC1 %{x:.2f} · PC2 %{y:.2f}<br>Pencilan multivariat: %{customdata[4]}<extra></extra>'}});
  const maxx=Math.max(...base.map(r=>Math.abs(r.PC1)));const maxy=Math.max(...base.map(r=>Math.abs(r.PC2)));const scale=Math.min(maxx,maxy)*.65;
  const annotations=M.vars.map(v=>({x:M.pca.loadings[v][0]*scale,y:M.pca.loadings[v][1]*scale,ax:0,ay:0,axref:'x',ayref:'y',xref:'x',yref:'y',showarrow:true,arrowhead:2,arrowsize:1,arrowwidth:1.2,arrowcolor:'#475569',text:M.labels[v],font:{size:10,color:'#334155'},bgcolor:'rgba(255,255,255,.75)',borderpad:2}));
  Plotly.react('pcaChart',traces,{dragmode:'lasso',margin:{l:55,r:30,t:18,b:55},xaxis:{title:`PC1 (${(M.pca.explained[0]*100).toFixed(2)}%)`,gridcolor:'#EEF2F7',zerolinecolor:'#CBD5E1'},yaxis:{title:`PC2 (${(M.pca.explained[1]*100).toFixed(2)}%)`,gridcolor:'#EEF2F7',zerolinecolor:'#CBD5E1'},paper_bgcolor:'white',plot_bgcolor:'white',font:{color:COLORS.text},legend:{orientation:'h',y:1.08},annotations,clickmode:'event+select',uirevision:'pca'}, {...graphConfig,modeBarButtonsToAdd:['lasso2d','select2d']});
  const chart=els('pcaChart');
  chart.removeAllListeners?.('plotly_selected');chart.removeAllListeners?.('plotly_click');
  chart.on('plotly_selected',ev=>{state.selectedKeys=(ev&&ev.points)?[...new Set(ev.points.map(p=>p.customdata&&p.customdata[0]).filter(Boolean))]:[];renderLinkedMultivariate();renderMap();updateSelectionStatus();renderPCAInterpretation();});
  chart.on('plotly_click',ev=>{const p=ev.points&&ev.points[0];if(p&&p.customdata&&p.customdata[0])selectRegion(p.customdata[0],true)});
  updateSelectionStatus();
}
function updateSelectionStatus(){els('selectionStatus').innerHTML=state.selectedKeys.length?`<b>${state.selectedKeys.length} wilayah dipilih.</b> Koordinat paralel, heatmap, dan peta mengikuti pilihan ini. <button class="clear-link" onclick="window.__clearPodesSelection()">Bersihkan</button>`:'Tarik lasso/box pada titik untuk memilih wilayah dan menautkannya ke visual lain.'}
window.__clearPodesSelection=()=>{state.selectedKeys=[];renderPCA();renderLinkedMultivariate();renderMap()};

function renderClusterProfile(){
  const xs=M.vars.map(v=>M.labels[v]);const data=[1,2,3].map(c=>({type:'scatter',mode:'lines+markers',name:'C'+c,x:xs,y:M.vars.map(v=>M.clusterProfiles[String(c)][v]),line:{color:clusterColor(c),width:2},marker:{size:6},hovertemplate:'%{x}<br>%{y:.1f}%<extra>C'+c+'</extra>'}));
  Plotly.react('clusterProfile',data,{margin:{l:45,r:15,t:20,b:100},xaxis:{tickangle:-40,automargin:true},yaxis:{title:'Persen (%)',range:[0,105],gridcolor:'#EEF2F7'},paper_bgcolor:'white',plot_bgcolor:'white',font:{color:COLORS.text},legend:{orientation:'h',y:1.08}}, {...graphConfig,displayModeBar:false});
  renderClusterProfileInterpretation();
}
function renderLinkedMultivariate(){renderParallel();renderHeatmap();}
function renderParallel(){
  let x=filtered({completeOnly:true,ignoreSelection:!state.selectedKeys.length});
  if(!x.length)x=filtered({completeOnly:true,ignoreSelection:true});
  const dims=M.vars.map(v=>({label:M.labels[v],values:x.map(r=>r[v+'_z']),range:[-6.5,6.5]}));
  const colors=x.map(r=>r.cluster||2);const cscale=[[0,COLORS.c1],[.333,COLORS.c1],[.334,COLORS.c2],[.666,COLORS.c2],[.667,COLORS.c3],[1,COLORS.c3]];
  Plotly.react('parallelChart',[{type:'parcoords',dimensions:dims,line:{color:colors,cmin:1,cmax:3,colorscale:cscale,showscale:false},labelfont:{size:11,color:COLORS.text},tickfont:{size:9,color:COLORS.muted}}],{margin:{l:45,r:45,t:25,b:45},paper_bgcolor:'white',font:{color:COLORS.text}}, {...graphConfig,displayModeBar:false});
  els('parallelScope').textContent=(state.selectedKeys.length?'Pilihan · ':'')+x.length+' wilayah';
  renderParallelInterpretation();
}
function renderHeatmap(){
  let x=filtered({completeOnly:true,ignoreSelection:!state.selectedKeys.length});
  x=x.slice().sort((a,b)=>(a.heat_rank??9999)-(b.heat_rank??9999));
  if(!x.length)x=filtered({completeOnly:true,ignoreSelection:true}).slice().sort((a,b)=>(a.heat_rank??9999)-(b.heat_rank??9999));
  const z=x.map(r=>M.vars.map(v=>r[v+'_z']));const y=x.map(r=>state.province==='ALL'&&x.length>80?'':r.kabupaten_kota);
  const custom=x.map(r=>M.vars.map(v=>[r.kabupaten_kota,r.provinsi,r[v],r.cluster_label]));
  Plotly.react('heatmapChart',[{type:'heatmap',z,x:M.vars.map(v=>M.labels[v]),y,customdata:custom,zmin:-3,zmax:3,zmid:0,colorscale:HEAT,colorbar:{title:'z-score',len:.75},hovertemplate:'<b>%{customdata[0]}</b><br>%{customdata[1]}<br>%{x}: %{customdata[2]:.1f}%<br>%{customdata[3]}<br>z=%{z:.2f}<extra></extra>'}],{margin:{l:state.province==='ALL'&&x.length>80?20:150,r:30,t:15,b:90},xaxis:{tickangle:-35,automargin:true},yaxis:{automargin:true},paper_bgcolor:'white',plot_bgcolor:'white',font:{color:COLORS.text}}, {...graphConfig,displayModeBar:false});
  renderHeatmapInterpretation();
}

function classify(value,br){if(value==null||!isFinite(value))return null;for(let i=0;i<br.length-1;i++){if(value<=br[i+1]||i===br.length-2)return i;}return br.length-2}
function discreteScale(cols){const n=cols.length,arr=[];for(let i=0;i<n;i++){const a=i/(n-1||1),b=(i+1)/(n-1||1);arr.push([Math.max(0,(i-.001)/(n-1||1)),cols[i]],[Math.min(1,(i+.999)/(n-1||1)),cols[i]])}return arr}
function viewportFromRows(rows){
  if(!rows.length)return {center:{lon:118.2,lat:-2.2},zoom:3.65};
  let minx=180,miny=90,maxx=-180,maxy=-90,seen=0;
  rows.forEach(r=>{
    const b=M.bboxes[r.wilayah_key];
    if(b){seen++;minx=Math.min(minx,b[0]);miny=Math.min(miny,b[1]);maxx=Math.max(maxx,b[2]);maxy=Math.max(maxy,b[3])}
  });
  if(!seen)return {center:{lon:118.2,lat:-2.2},zoom:3.65};
  const lonSpan=Math.max(.15,maxx-minx),latSpan=Math.max(.15,maxy-miny);
  const span=Math.max(lonSpan,latSpan*1.45);
  let zoom=span>40?3.65:span>28?3.85:span>18?4.15:span>10?4.65:span>6?5.15:span>3?5.75:span>1.5?6.25:6.7;
  return {center:{lon:(minx+maxx)/2,lat:(miny+maxy)/2},zoom};
}
function mapViewport(sub){
  const selected=state.selectedRegion?byKey.get(state.selectedRegion):null;
  if(selected&&sub.some(r=>r.wilayah_key===selected.wilayah_key)){
    const context=sub.filter(r=>r.provinsi===selected.provinsi);
    const view=viewportFromRows(context.length?context:[selected]);
    view.zoom=Math.min(6.45,view.zoom+.18);
    return view;
  }
  const view=viewportFromRows(sub);
  if(state.province!=='ALL')view.zoom=Math.min(6.25,view.zoom+.12);
  return view;
}
function currentMapZoom(){
  const chart=els('mapChart');
  const z=chart&&chart._fullLayout&&chart._fullLayout.mapbox?chart._fullLayout.mapbox.zoom:null;
  return isFinite(z)?z:null;
}
function zoomMap(delta){
  const z=currentMapZoom();if(z==null)return;
  Plotly.relayout('mapChart',{'mapbox.zoom':Math.max(2.5,Math.min(9,z+delta))});
}
function resetGeographyToIndonesia(){
  state.province='ALL';state.region='ALL';state.selectedRegion=null;state.selectedKeys=[];
  els('provinceFilter').value='ALL';updateRegionOptions();els('regionFilter').value='ALL';
  closeDrawer();renderAll();
}
function renderMap(reset=false){
  const sub=filtered({ignoreSelection:true});
  const v=state.indicator; const br=M.breaks[v][state.classification]; const view=mapViewport(sub); const ids=sub.map(r=>r.wilayah_key); const traces=[]; const titleLabel=M.labels[v];
  if(state.mapType==='choropleth'){
    traces.push({type:'choroplethmapbox',geojson:G,featureidkey:'properties.wilayah_key',locations:ids,z:ids.map(()=>0),zmin:0,zmax:1,colorscale:[[0,COLORS.na],[1,COLORS.na]],showscale:false,hoverinfo:'skip',showlegend:false,marker:{line:{color:'#FFFFFF',width:.35}},opacity:state.basemap==='satellite'?.28:1});
    if(state.clusterLayer){
      const valid=sub.filter(r=>r.cluster!=null); const cs=[[0,COLORS.c1],[.249,COLORS.c1],[.25,COLORS.c2],[.749,COLORS.c2],[.75,COLORS.c3],[1,COLORS.c3]];
      traces.push({type:'choroplethmapbox',geojson:G,featureidkey:'properties.wilayah_key',locations:valid.map(r=>r.wilayah_key),z:valid.map(r=>r.cluster),customdata:valid.map(r=>[r.wilayah_key,r.kabupaten_kota,r.provinsi,r.cluster_label,r[v],r.desa_kelurahan]),zmin:1,zmax:3,colorscale:cs,showscale:false,showlegend:false,opacity:state.basemap==='satellite'?.72:.92,marker:{line:{color:'#FFFFFF',width:.35}},hovertemplate:'<b>%{customdata[1]}</b><br>%{customdata[2]}<br>%{customdata[3]}<br>'+titleLabel+': %{customdata[4]:.1f}%<br>Desa/kel.: %{customdata[5]}<br><span style="color:#C8D5E4">Klik untuk detail</span><extra></extra>'});
    }else{
      const valid=sub.filter(r=>r[v]!=null); const classes=valid.map(r=>classify(r[v],br)); const cs=[[0,CIV[0]],[.249,CIV[0]],[.25,CIV[1]],[.499,CIV[1]],[.5,CIV[2]],[.749,CIV[2]],[.75,CIV[3]],[.999,CIV[3]],[1,CIV[4]]];
      traces.push({type:'choroplethmapbox',geojson:G,featureidkey:'properties.wilayah_key',locations:valid.map(r=>r.wilayah_key),z:classes,customdata:valid.map(r=>[r.wilayah_key,r.kabupaten_kota,r.provinsi,r[v],M.national[v],r.cluster_label,r.desa_kelurahan]),zmin:0,zmax:4,colorscale:cs,showscale:false,showlegend:false,opacity:state.basemap==='satellite'?.72:.92,marker:{line:{color:'#FFFFFF',width:.35}},hovertemplate:'<b>%{customdata[1]}</b><br>%{customdata[2]}<br>'+titleLabel+': %{customdata[3]:.1f}%<br>Nasional: %{customdata[4]:.1f}%<br>%{customdata[5]}<br>Desa/kel.: %{customdata[6]}<br><span style="color:#C8D5E4">Klik untuk detail</span><extra></extra>'});
    }
  }else{
    traces.push({type:'choroplethmapbox',geojson:G,featureidkey:'properties.wilayah_key',locations:ids,z:ids.map(()=>0),zmin:0,zmax:1,colorscale:[[0,'#EEF3F8'],[1,'#EEF3F8']],showscale:false,hoverinfo:'skip',showlegend:false,marker:{line:{color:'#CBD5E1',width:.45}},opacity:state.basemap==='satellite'?.16:.92});
    const cm=M.countMap[v]; const pts=sub.filter(r=>r[cm]!=null&&M.centroids[r.wilayah_key]); const max=Math.max(1,...pts.map(r=>r[cm]));
    traces.push({type:'scattermapbox',mode:'markers',name:'Jumlah desa/kel.',showlegend:false,lon:pts.map(r=>M.centroids[r.wilayah_key].lon),lat:pts.map(r=>M.centroids[r.wilayah_key].lat),customdata:pts.map(r=>[r.wilayah_key,r.kabupaten_kota,r.provinsi,r[cm],r[v],r.cluster_label]),marker:{size:pts.map(r=>5+27*Math.sqrt(r[cm]/max)),color:indicatorColor(v),opacity:.72,line:{color:'#FFFFFF',width:1.25}},hovertemplate:'<b>%{customdata[1]}</b><br>%{customdata[2]}<br>Jumlah desa/kel.: %{customdata[3]}<br>'+titleLabel+': %{customdata[4]:.1f}%<br>%{customdata[5]}<br><span style="color:#C8D5E4">Klik untuk detail</span><extra></extra>'});
  }
  if(state.outlierLayer){ const out=sub.filter(r=>r.outlier_99==='YES'&&M.centroids[r.wilayah_key]); traces.push({type:'scattermapbox',mode:'markers',name:'Profil tidak biasa (99%)',showlegend:false,lon:out.map(r=>M.centroids[r.wilayah_key].lon),lat:out.map(r=>M.centroids[r.wilayah_key].lat),customdata:out.map(r=>[r.wilayah_key,r.kabupaten_kota,r.provinsi]),marker:{size:9,color:COLORS.outlier,symbol:'diamond',opacity:.9},hovertemplate:'◆ <b>%{customdata[1]}</b><br>%{customdata[2]}<br>Profil multivariat tidak biasa (99%)<br><span style="color:#C8D5E4">Klik untuk detail</span><extra></extra>'}); }
  const sel=state.selectedKeys.length?sub.filter(r=>state.selectedKeys.includes(r.wilayah_key)):(state.selectedRegion?[byKey.get(state.selectedRegion)].filter(Boolean):[]);
  if(sel.length){ traces.push({type:'scattermapbox',mode:'markers',name:'Wilayah dipilih',showlegend:false,lon:sel.map(r=>M.centroids[r.wilayah_key].lon),lat:sel.map(r=>M.centroids[r.wilayah_key].lat),customdata:sel.map(r=>[r.wilayah_key,r.kabupaten_kota]),marker:{size:16,color:'rgba(0,0,0,0)',line:{color:'#0F172A',width:2.8}},hoverinfo:'skip'}); }
  const mapLayout={margin:{l:0,r:0,t:0,b:0},paper_bgcolor:state.basemap==='light'?'#EAF4FF':'#FFFFFF',font:{color:COLORS.text},hoverlabel:{bgcolor:'#10243E',bordercolor:'#10243E',font:{color:'#FFFFFF',size:12},align:'left'},mapbox:basemapConfig(view),showlegend:false,uirevision:reset?`fit-${state.province}-${state.selectedRegion||'none'}-${Date.now()}`:`map-${state.province}-${state.selectedRegion||'none'}-${state.mapType}-${state.basemap}`};
  Plotly.react('mapChart',traces,mapLayout,{...graphConfig,displayModeBar:false,scrollZoom:true});
  const chart=els('mapChart');
  chart.style.background = state.basemap==='light'
    ? 'linear-gradient(180deg,#EAF4FF 0%,#DCEEFF 100%)'
    : (state.basemap==='satellite'
      ? 'linear-gradient(180deg,#E5ECF3 0%,#D9E3EC 100%)'
      : 'linear-gradient(180deg,#F8FBFF 0%,#F4F8FC 100%)'); chart.removeAllListeners?.('plotly_click'); chart.removeAllListeners?.('plotly_hover'); chart.removeAllListeners?.('plotly_unhover');
  const setMapCursor=(value)=>{chart.style.cursor=value; const c=chart.querySelector('.mapboxgl-canvas'); if(c)c.style.cursor=value;};
  setMapCursor('grab');
  chart.on('plotly_hover',ev=>{const p=ev.points&&ev.points[0]; const key=p&&((p.location&&byKey.has(p.location))?p.location:(p.customdata&&p.customdata[0])); setMapCursor(key&&byKey.has(key)?'pointer':'grab');});
  chart.on('plotly_unhover',()=>setMapCursor('grab'));
  chart.on('plotly_click',ev=>{const p=ev.points&&ev.points[0];if(!p)return; const key=(p.location&&byKey.has(p.location))?p.location:(p.customdata&&p.customdata[0]); if(key&&byKey.has(key))selectRegion(key,true);});
  els('mapTitle').textContent=state.mapType==='choropleth'?`Persentase desa/kelurahan — ${titleLabel}, 2024`:`Jumlah desa/kelurahan — ${titleLabel}, 2024`;
  const cls=state.classification==='jenks'?'Natural Breaks':state.classification==='quantile'?'Quantile':'Equal Interval';
  els('mapSubtitle').textContent=state.mapType==='choropleth'?`Kabupaten/kota · ${state.clusterLayer?'Layer cluster':cls+' · 5 kelas'} · ${state.province==='ALL'?'cakupan nasional':'fit '+state.province}.`:'Area simbol proporsional terhadap jumlah desa/kelurahan; warna mengikuti kelompok indikator.';
  els('mapScope').textContent=sub.length+' wilayah'; els('mapIndonesia').disabled=state.province==='ALL'&&!state.selectedRegion; renderMapLegend(sub,br); renderBasemapInfo(); renderMapInterpretation(sub);
}

function hierarchyData(){
  const sub=filtered({ignoreSelection:true});const v=state.indicator;const ids=[],labels=[],parents=[],values=[],colors=[],custom=[];
  const root=state.province==='ALL'?'Indonesia':state.province;ids.push('ROOT');labels.push(root);parents.push('');values.push(sub.reduce((a,r)=>a+r.desa_kelurahan,0));colors.push(weighted(sub,v));custom.push(['ROOT',root,'',sub.length]);
  if(state.province==='ALL'){
    const provs=[...new Set(sub.map(r=>r.provinsi))].sort((a,b)=>a.localeCompare(b,'id'));
    provs.forEach(p=>{const g=sub.filter(r=>r.provinsi===p);ids.push('PROV|'+p);labels.push(p);parents.push('ROOT');values.push(g.reduce((a,r)=>a+r.desa_kelurahan,0));colors.push(weighted(g,v));custom.push(['PROV',p,'',g.length]);g.forEach(r=>{ids.push(r.wilayah_key);labels.push(r.kabupaten_kota);parents.push('PROV|'+p);values.push(r.desa_kelurahan);colors.push(r[v]);custom.push(['REG',r.wilayah_key,r.provinsi,1])})});
  } else sub.forEach(r=>{ids.push(r.wilayah_key);labels.push(r.kabupaten_kota);parents.push('ROOT');values.push(r.desa_kelurahan);colors.push(r[v]);custom.push(['REG',r.wilayah_key,r.provinsi,1])});
  return {ids,labels,parents,values,colors,custom};
}
function renderHierarchy(){
  const h=hierarchyData();
  const trace={
    type:state.hierarchyType,ids:h.ids,labels:h.labels,parents:h.parents,values:h.values,branchvalues:'total',
    customdata:h.custom,
    marker:{colors:h.colors,colorscale:[[0,CIV[0]],[.25,CIV[1]],[.5,CIV[2]],[.75,CIV[3]],[1,CIV[4]]],cmin:0,cmax:100,colorbar:{title:'%',thickness:12,len:.7}},
    hovertemplate:'<b>%{label}</b><br>Desa/kel.: %{value}<br>'+M.labels[state.indicator]+': %{color:.1f}%<br><span style="color:#64748B">Klik untuk membuka level/detail</span><extra></extra>'
  };
  if(state.hierarchyType==='treemap'){
    trace.pathbar={visible:true};
    trace.textinfo='label+value';
  }else trace.insidetextorientation='radial';

  Plotly.react('hierarchyChart',[trace],{
    margin:{l:10,r:10,t:10,b:10},
    paper_bgcolor:'white',
    font:{color:COLORS.text},
    hoverlabel:{bgcolor:'#10243E',bordercolor:'#10243E',font:{color:'#FFFFFF',size:12},align:'left'}
  },{...graphConfig,displayModeBar:false});

  const chart=els('hierarchyChart');
  chart.removeAllListeners?.('plotly_click');
  chart.removeAllListeners?.('plotly_hover');
  chart.removeAllListeners?.('plotly_unhover');
  chart.on('plotly_hover',()=>{chart.style.cursor='pointer'});
  chart.on('plotly_unhover',()=>{chart.style.cursor='default'});
  chart.on('plotly_click',ev=>{
    const p=ev.points&&ev.points[0];
    if(!p||!p.customdata)return;
    const type=p.customdata[0];
    if(type==='REG'){
      const rr=byKey.get(p.customdata[1]);
      if(rr&&state.province==='ALL'){
        state.province=rr.provinsi;
        els('provinceFilter').value=state.province;
        updateRegionOptions();
      }
      selectRegion(p.customdata[1],true);
    }
    if(type==='PROV'){
      state.province=p.customdata[1];
      state.region='ALL';
      state.selectedRegion=null;
      els('provinceFilter').value=state.province;
      updateRegionOptions();
      els('regionFilter').value='ALL';
      renderAll();
    }
  });

  const crumbs=[`<button type="button" class="crumb ${state.province==='ALL'?'active':''}" data-hier="root">Indonesia</button>`];
  if(state.province!=='ALL'){
    crumbs.push('<span class="crumb-sep">›</span>');
    crumbs.push(`<button type="button" class="crumb ${state.selectedRegion?'':'active'}" data-hier="province">${state.province}</button>`);
  }
  if(state.selectedRegion&&byKey.get(state.selectedRegion)){
    crumbs.push('<span class="crumb-sep">›</span>');
    crumbs.push(`<button type="button" class="crumb active" data-hier="region">${byKey.get(state.selectedRegion).kabupaten_kota}</button>`);
  }
  els('breadcrumb').innerHTML=crumbs.join('');
  els('breadcrumb').querySelectorAll('[data-hier]').forEach(btn=>btn.addEventListener('click',()=>{
    const level=btn.dataset.hier;
    if(level==='root'){
      state.province='ALL';state.region='ALL';state.selectedRegion=null;state.selectedKeys=[];
      els('provinceFilter').value='ALL';updateRegionOptions();els('regionFilter').value='ALL';
      closeDrawer();renderAll();
    }else if(level==='province'){
      state.region='ALL';state.selectedRegion=null;els('regionFilter').value='ALL';
      closeDrawer();renderAll();
    }
  }));

  els('hierUp').disabled=state.province==='ALL'&&!state.selectedRegion;
  els('hierReset').disabled=state.province==='ALL'&&!state.selectedRegion;
  renderHierarchyInterpretation();
}

function selectRegion(key,open=true){const r=byKey.get(key);if(!r)return;state.selectedRegion=key;state.region=key;if(state.province!=='ALL'&&state.province!==r.provinsi){state.province=r.provinsi;els('provinceFilter').value=r.provinsi;updateRegionOptions()}els('regionFilter').value=key;renderCurrent();if(open)openDrawer(r)}
function openDrawer(r){els('drawerTitle').textContent=r.kabupaten_kota;els('drawerSub').textContent=r.provinsi+' · Kode boundary '+(r.boundary_code_kab||'—');els('drawerBadge').textContent=r.cluster?`C${r.cluster} — ${r.cluster_label}`:'PCA/cluster tidak tersedia';els('drawerBadge').style.borderColor=r.cluster?clusterColor(r.cluster):COLORS.na;els('drawerMetrics').innerHTML=`<div class="mini-metric"><span>PC1</span><strong>${r.PC1==null?'NA':(r.PC1>=0?'+':'')+fmt1(r.PC1)}</strong></div><div class="mini-metric"><span>PC2</span><strong>${r.PC2==null?'NA':(r.PC2>=0?'+':'')+fmt1(r.PC2)}</strong></div><div class="mini-metric"><span>Profil tidak biasa</span><strong>${r.outlier_99==='YES'?'Ya · 99%':'Tidak'}</strong></div><div class="mini-metric"><span>Desa/Kel.</span><strong>${fmt0(r.desa_kelurahan)}</strong></div>`;
  const prov=R.filter(x=>x.provinsi===r.provinsi);const ys=M.vars.map(v=>M.labels[v]);const nat=M.vars.map(v=>M.national[v]);const pv=M.vars.map(v=>weighted(prov,v));const rv=M.vars.map(v=>r[v]);Plotly.react('drawerCompareChart',[{type:'bar',orientation:'h',name:r.kabupaten_kota,y:ys,x:rv,marker:{color:COLORS.accent}},{type:'scatter',mode:'markers',name:'Provinsi',y:ys,x:pv,marker:{color:COLORS.c2,size:8,symbol:'diamond'}},{type:'scatter',mode:'markers',name:'Nasional',y:ys,x:nat,marker:{color:'#334155',size:8,symbol:'line-ns-open'}}],{barmode:'overlay',margin:{l:115,r:15,t:40,b:45},xaxis:{title:'Persen (%)',range:[0,105],gridcolor:'#EEF2F7'},yaxis:{automargin:true},legend:{orientation:'h',y:1.08},paper_bgcolor:'white',plot_bgcolor:'white',font:{color:COLORS.text}}, {...graphConfig,displayModeBar:false});renderDrawerInterpretation(r,prov);els('drawerNote').textContent=r.quality_note&&r.quality_note!=='OK'?r.quality_note:(r.outlier_99==='YES'?'Profil gabungan delapan indikator wilayah ini ditandai sebagai pencilan pada ambang Mahalanobis 99%; penanda tersebut tidak berarti datanya salah.':'Nilai wilayah dibandingkan dengan agregat provinsi dan nasional yang dibobot jumlah desa/kelurahan.');els('regionDrawer').classList.add('open')}
function closeDrawer(){els('regionDrawer').classList.remove('open')}

function renderCompare(){const keys=['compare1','compare2','compare3'].map(id=>els(id).value).filter(Boolean);const uniq=[...new Set(keys)];const data=uniq.map((k,i)=>{const r=byKey.get(k);return {type:'bar',orientation:'h',name:r.kabupaten_kota,y:M.vars.map(v=>M.labels[v]),x:M.vars.map(v=>r[v]),hovertemplate:'<b>'+r.kabupaten_kota+'</b><br>%{y}: %{x:.1f}%<extra></extra>'}});Plotly.react('compareChart',data,{barmode:'group',margin:{l:135,r:20,t:20,b:45},xaxis:{title:'Persentase desa/kelurahan (%)',range:[0,105],gridcolor:'#EEF2F7'},yaxis:{automargin:true},legend:{orientation:'h',y:1.08},paper_bgcolor:'white',plot_bgcolor:'white',font:{color:COLORS.text}}, {...graphConfig,displayModeBar:false});renderCompareInterpretation();}

function renderCurrent(){if(state.page==='overview')renderOverview();else if(state.page==='multivariate'){renderPCA();renderClusterProfile();renderLinkedMultivariate()}else if(state.page==='spatial')renderMap();else if(state.page==='hierarchy')renderHierarchy();}
function renderAll(){renderCurrent();}
function bind(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>navTo(b.dataset.page)));
  els('provinceFilter').addEventListener('change',e=>{state.province=e.target.value;state.region='ALL';state.selectedRegion=null;state.selectedKeys=[];updateRegionOptions();renderAll()});
  els('regionFilter').addEventListener('change',e=>{state.region=e.target.value;if(e.target.value==='ALL'){state.selectedRegion=null;closeDrawer();renderCurrent()}else selectRegion(e.target.value,true)});
  els('indicatorFilter').addEventListener('change',e=>{state.indicator=e.target.value;renderCurrent()});
  els('clusterFilter').addEventListener('change',e=>{state.cluster=e.target.value;state.selectedKeys=[];renderAll()});
  els('outlierOnly').addEventListener('change',e=>{state.outlierOnly=e.target.checked;state.selectedKeys=[];renderAll()});
  els('resetBtn').addEventListener('click',()=>{Object.assign(state,{province:'ALL',region:'ALL',indicator:'pct_4g5g',cluster:'ALL',outlierOnly:false,selectedKeys:[],selectedRegion:null,mapType:'choropleth',classification:'jenks',basemap:'plain',clusterLayer:false,outlierLayer:true,hierarchyType:'treemap'});els('provinceFilter').value='ALL';updateRegionOptions();els('regionFilter').value='ALL';els('indicatorFilter').value='pct_4g5g';els('clusterFilter').value='ALL';els('outlierOnly').checked=false;els('mapType').value='choropleth';els('classification').value='jenks';els('basemapMode').value='plain';els('clusterLayer').checked=false;els('outlierLayer').checked=true;els('hierarchyType').value='treemap';closeDrawer();renderAll()});
  els('mapType').addEventListener('change',e=>{state.mapType=e.target.value;renderMap()});
  els('classification').addEventListener('change',e=>{state.classification=e.target.value;renderMap()});
  els('basemapMode').addEventListener('change',e=>{state.basemap=e.target.value;renderMap()});
  els('clusterLayer').addEventListener('change',e=>{state.clusterLayer=e.target.checked;renderMap()});
  els('outlierLayer').addEventListener('change',e=>{state.outlierLayer=e.target.checked;renderMap()});
  els('resetMap').addEventListener('click',()=>renderMap(true));
  els('mapZoomIn').addEventListener('click',()=>zoomMap(.65));
  els('mapZoomOut').addEventListener('click',()=>zoomMap(-.65));
  els('mapIndonesia').addEventListener('click',resetGeographyToIndonesia);
  els('hierarchyType').addEventListener('change',e=>{state.hierarchyType=e.target.value;renderHierarchy()});
  els('hierUp').addEventListener('click',()=>{
    if(state.selectedRegion){
      state.region='ALL';state.selectedRegion=null;els('regionFilter').value='ALL';closeDrawer();renderAll();
    }else if(state.province!=='ALL'){
      state.province='ALL';state.region='ALL';state.selectedKeys=[];
      els('provinceFilter').value='ALL';updateRegionOptions();els('regionFilter').value='ALL';renderAll();
    }
  });
  els('hierReset').addEventListener('click',()=>{
    state.province='ALL';state.region='ALL';state.selectedRegion=null;state.selectedKeys=[];
    els('provinceFilter').value='ALL';updateRegionOptions();els('regionFilter').value='ALL';
    closeDrawer();renderAll();
  });
  els('clearSelection').addEventListener('click',window.__clearPodesSelection);
  els('drawerClose').addEventListener('click',closeDrawer);
  els('compareBtn').addEventListener('click',()=>{els('comparePanel').classList.add('open');renderCompare()});els('compareClose').addEventListener('click',()=>els('comparePanel').classList.remove('open'));['compare1','compare2','compare3'].forEach(id=>els(id).addEventListener('change',renderCompare));
  window.addEventListener('resize',()=>{document.querySelectorAll('.js-plotly-plot').forEach(x=>Plotly.Plots.resize(x))});
}
initControls();bind();renderCurrent();
})();
