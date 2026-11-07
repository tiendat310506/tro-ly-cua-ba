/* ===== Làm sạch câu trả lời theo từng câu hỏi (giá, size, mã...) ===== */
const VN_NUM={'không':0,'một':1,'mốt':1,'hai':2,'ba':3,'bốn':4,'tư':4,'năm':5,'lăm':5,'nhăm':5,'sáu':6,'bảy':7,'bẩy':7,'tám':8,'chín':9,'mười':10};
const VN_MUL={'mươi':10,'chục':10,'trăm':100,'nghìn':1000,'ngàn':1000,'ngàng':1000,'triệu':1e6,'củ':1e6};
// Đọc 1 dãy chữ số tiếng Việt → số. vd "một trăm năm mươi nghìn" → 150000, "trăm rưỡi" → 150, "một triệu hai" → 1200000
function vnGroup(ws){let h=0,t=0,u=0,p=null,afterH=false,linh=false,tensSet=false,any=false;
  for(const w of ws){
    if(w==='mười'){t=1;tensSet=true;any=true}
    else if(w in VN_NUM){const d=VN_NUM[w];any=true;if(tensSet)u=d;else if(p!==null){t=p;u=d;p=null;tensSet=true}else p=d} // "hai lăm" = 25
    else if(w==='trăm'){h=p===null?1:p;p=null;afterH=true;any=true}
    else if(w==='mươi'||w==='chục'){t=p===null?1:p;p=null;tensSet=true;any=true}
    else if(w==='linh'||w==='lẻ'){linh=true}
    else if(w==='rưỡi'){if(afterH&&!tensSet){t=5;tensSet=true}else u=5;any=true}
    else return null}
  if(p!==null){if(afterH&&!tensSet&&!linh)t=p;else u=p}
  return any?h*100+t*10+u:null}
function vnWordsToNum(ws){let total=0,grp=[],lastM=0;
  for(const w of ws){const m=(w==='nghìn'||w==='ngàn'||w==='ngàng')?1000:(w==='triệu'||w==='củ')?1e6:0;
    if(m){const g=grp.length?vnGroup(grp):1;if(g===null)return null;total+=g*m;grp=[];lastM=m}
    else grp.push(w)}
  if(grp.length){
    if(lastM&&grp.length===1&&grp[0]==='rưỡi')total+=lastM/2;
    else if(lastM&&grp.length===1&&grp[0] in VN_NUM)total+=VN_NUM[grp[0]]*lastM/10; // "triệu hai" = 1.200.000
    else{const g=vnGroup(grp);if(g===null)return null;total+=g}}
  return total}
const NUMW=Object.keys(VN_NUM).concat(Object.keys(VN_MUL),['linh','lẻ','rưỡi']);
// Thay các cụm chữ số bằng chữ số (chỉ cụm có từ 2 chữ trở lên hoặc có "trăm/nghìn/mươi")
function wordsToDigits(t){const toks=t.split(/\s+/);const out=[];
  for(let i=0;i<toks.length;){let j=i;while(j<toks.length&&NUMW.includes(toks[j].toLowerCase()))j++;
    if(j>i){const run=toks.slice(i,j).map(x=>x.toLowerCase());
      const hasNum=run.some(w=>w in VN_NUM||w==='rưỡi');
      const prevDigit=out.length&&/^\d+$/.test(out[out.length-1]);
      const strong=hasNum&&!(prevDigit&&run[0] in VN_MUL)&&(run.length>=2||run.some(w=>w in VN_MUL));
      const n=strong?vnWordsToNum(run):null;
      if(n!==null){out.push(String(n));i=j;continue}}
    out.push(toks[i]);i++}
  return out.join(' ')}
function fmtPrice(n){if(n>=1e6){const tr=Math.floor(n/1e6),r=Math.round((n%1e6)/1e5);return tr+'tr'+(r?r:'')}
  if(n>=1000&&n%1000===0)return (n/1000)+'k';if(n<1000)return n+'k';return n.toLocaleString('vi-VN')+'đ'}
const EW='(?=[\\s,.;!?)]|$)';
const LETTER={'a':'A','bê':'B','bờ':'B','xê':'C','cờ':'C','dê':'D','đê':'Đ','đờ':'Đ','e':'E','ép':'F','gờ':'G','giê':'G','hát':'H','hờ':'H','i':'I','gi':'J','ca':'K','lờ':'L','en lờ':'L','eo':'L','em':'M','mờ':'M','en':'N','nờ':'N','o':'O','pê':'P','pờ':'P','quy':'Q','e rờ':'R','rờ':'R','ét':'S','sờ':'S','tê':'T','tờ':'T','u':'U','vê':'V','vờ':'V','vê kép':'W','ích':'X','ích xì':'X','xì':'X','i dài':'Y','dét':'Z'};
function normalizeAnswer(t,key){t=t.replace(/\s+/g,' ').trim();if(!t)return t;
  const low=t.toLowerCase();
  if(/^(không|ko|hông|hổng)( có| có mã| có gì)?( đâu)?( con)?\.?$/i.test(low))return 'Không có';
  if(key==='Giá'||key==='Size'||key==='Mã')t=wordsToDigits(t);
  // 150.000 / 150,000 → 150000
  t=t.replace(/(\d{1,3})(?:[.,](\d{3}))+(?!\d)/g,m=>m.replace(/[.,]/g,''));
  if(key==='Giá'){
    t=t.replace(new RegExp('(\\d+)\\s*(triệu|củ)\\s*rưỡi'+EW,'gi'),(m,a)=>String(+a*1e6+5e5)).replace(new RegExp('(\\d+)\\s*(nghìn|ngàn)\\s*rưỡi'+EW,'gi'),(m,a)=>String(+a*1000+500));
    t=t.replace(new RegExp('(\\d+)\\s*(nghìn|ngàn|ngàng|k|ca|ka)'+EW,'gi'),(m,a)=>String(+a*1000));
    t=t.replace(new RegExp('(\\d+)\\s*(triệu|củ)(?:\\s*(\\d)(?!\\d))?','gi'),(m,a,_,b)=>String(+a*1e6+(b?+b*1e5:0)));
    t=t.replace(new RegExp('(\\d+)\\s*(đồng|đ|vnđ)'+EW,'gi'),'$1');
    t=t.replace(/\d+/g,m=>{const n=+m;return fmtPrice(n<1000&&n>=10?n*1000:n)});
    t=t.replace(/^(giá|bán|bán giá|giá bán)\s+/i,'');
  }
  if(key==='Size'){
    t=t.replace(new RegExp('(\\d+)\\s*(ký|kí|kg|cân|ki lô|kí lô|ký lô|ki|kilô|kilogam)'+EW,'gi'),'$1kg');
    t=t.replace(/(\d+)\s*(?:-|đến|tới|tới khoảng|đến khoảng)\s*(\d+)\s*kg/gi,'$1kg đến $2kg');
    t=t.replace(/(\d+)\s*(?:-|đến|tới)\s*(\d+kg)/gi,'$1kg đến $2');
    // chữ cái size: ét → S, em → M, eo → L, ích eo → XL
    t=t.replace(/\b(size|sai|sải)\s*/gi,'size ');
    t=t.replace(/\b(xích xích eo|ích ích eo|hai ích eo|2 ích eo)\b/gi,'XXL').replace(/\b(ích eo|xích eo|ích lờ|xl)\b/gi,'XL')
     .replace(/\bsize (ét|ếch)\b/gi,'size S').replace(/\bsize (em|mờ)\b/gi,'size M').replace(/\bsize (eo|lờ|en lờ)\b/gi,'size L')
     .replace(/size (xxl|xl|s|m|l)(?![a-zà-ỹ])/gi,(m,a)=>'size '+a.toUpperCase()).replace(/free ?size|phi sai|phri sai/gi,'Freesize').replace(/Freesize\s*$/,'Freesize');
  }
  if(key==='Mã'){
    t=t.replace(/^(mã số là|mã số|mã là|mã|số)\s+/i,'');
    // ghép chữ cái đọc rời: "a bê 12" → "AB12"
    const toks=t.toLowerCase().split(' ');let out='',ok=true;
    for(let i=0;i<toks.length;i++){const two=toks[i]+' '+(toks[i+1]||'');
      if(LETTER[two]){out+=LETTER[two];i++}else if(LETTER[toks[i]])out+=LETTER[toks[i]];
      else if(/^[a-z0-9]+$/i.test(toks[i]))out+=toks[i].toUpperCase();else{ok=false;break}}
    if(ok&&out)t=out;
  }
  if(key==='Màu'){t=t.replace(/\s+(và|với|với lại)\s+/gi,', ').replace(/^(có |màu )+/i,'').replace(/\b(màu)\s+/gi,'')}
  t=t.replace(/\s+([,.])/g,'$1');
  return t.charAt(0).toUpperCase()+t.slice(1)}
// Chọn cách nghe hợp nhất với câu đang hỏi trong các khả năng máy đưa ra
const COLORS=/đỏ|xanh|vàng|trắng|đen|hồng|tím|cam|nâu|xám|ghi|be|kem|bạc|rêu|đô|than|pastel|caro|hoa|sọc/i;
function pickAlt(res,key){let best=res[0],bs=-1;
  for(let a=0;a<res.length;a++){const t=(res[a]&&res[a].transcript)||'';let s=(res[a].confidence||0)+(a===0?.15:0);
    if(key==='Giá'&&/\d|trăm|nghìn|ngàn|chục|mươi|triệu|rưỡi/i.test(t))s+=.5;
    if(key==='Size'&&/\d|ký|kí|kg|cân|size|free/i.test(t))s+=.5;
    if(key==='Mã'&&/\d/.test(t))s+=.4;
    if(key==='Màu'&&COLORS.test(t))s+=.5;
    if(s>bs){bs=s;best=res[a]}}
  return (best&&best.transcript)||''}
if(typeof module!=='undefined')module.exports={normalizeAnswer,vnWordsToNum,wordsToDigits,pickAlt};
