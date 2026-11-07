// node run.js [android]
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const android=process.argv[2]==='android';
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext(android?{userAgent:'Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',viewport:{width:390,height:844}}:{viewport:{width:1200,height:800}});
await ctx.addInitScript({path:path.join(__dirname,'mock.js')});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(300);
const W=ms=>p.waitForTimeout(ms);const E=f=>p.evaluate(f);
let fails=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};
const until=async(f,ms=4000)=>{const t=Date.now();while(Date.now()-t<ms){if(await E(f))return true;await W(50)}return false};
const recN=()=>E(()=>window.__recs.length);
const active=()=>E(()=>!!rec);
const lastMe=()=>E(()=>{const m=[...document.querySelectorAll('.b.me')];return m.length?m[m.length-1].textContent:''});
// vào bước trả lời câu hỏi 1 (bỏ qua chọn ảnh)
async function toQ1(){await E(()=>{stopAll();photos=[];answers=QUESTIONS.map(()=>'');qi=-1;$('msgs').innerHTML='';nextQuestion()});await until(()=>!!rec&&stage==='answer')}

console.log('Kịch bản 1: trả lời bình thường, có kết quả tạm rồi kết quả cuối');
await toQ1();ok(await active(),'tự bật micro sau khi hỏi');
await E(()=>__sr.emit([['đầm voan',false]]));await W(50);
await E(()=>__sr.emit([['đầm voan hoa',true]]));await W(1800);
ok((await lastMe())==='Đầm voan hoa','nhận đúng câu: '+await lastMe());
ok(await E(()=>stage)==='confirm','chuyển sang xác nhận');
await W(400);ok(await until(()=>!!rec&&stage==='confirm'),'tự bật micro để nghe xác nhận');
await E(()=>__sr.emit([['đúng rồi',true]]));await until(()=>qi===1);
ok(await E(()=>answers[0])==='Đầm voan hoa','lưu câu trả lời: '+await E(()=>answers[0]));
ok(await E(()=>qi)===1,'sang câu 2');

console.log('Kịch bản 2: Android trả kết quả cuối bị lặp (cộng dồn)');
await toQ1();
await E(()=>{window.__ri=0;__sr.emit([['giá',true]])});await W(50);
await E(()=>{window.__ri=1;__sr.emit([['giá',true],['giá 150 nghìn',true]])});await W(1800);
await E(()=>window.__ri=0);
ok((await lastMe())==='Giá 150 nghìn','không bị lặp chữ: '+await lastMe());

console.log('Kịch bản 3: bấm "Đúng rồi" khi micro đang nghe → câu hỏi kế không bị micro thu vào');
await toQ1();await E(()=>__sr.emit([['áo thun',true]]));await until(()=>!!rec&&stage==='confirm');
ok(await active(),'đang nghe xác nhận');
const before=await recN();
await E(()=>{const b=[...document.querySelectorAll('#quick button')].find(x=>/Đúng rồi/.test(x.textContent));b.click()});await W(30);
// micro cũ phải bị tắt; giả sử micro cũ thu được tiếng câu hỏi
const oldRec=await E(()=>window.__recs.length-1);
await E(()=>{const r=window.__recs[window.__recs.length-1];if(!r.ended)r.emit([['dạ món này có mã số gì không bà nội',true]])});await W(1800);
ok(await E(()=>answers[0])==='Áo thun','câu 1 lưu đúng: '+await E(()=>answers[0]));
ok(!/mã số/.test(await lastMe()),'không lấy tiếng câu hỏi làm câu trả lời: '+await lastMe());

console.log('Kịch bản 4: bấm "Nói lại" khi micro đang nghe → phải nghe lại, không gửi luôn');
await toQ1();await E(()=>__sr.emit([['quần jean',true]]));await until(()=>!!rec&&stage==='confirm');
ok(await active(),'đang nghe xác nhận');
await E(()=>{const b=[...document.querySelectorAll('#quick button')].find(x=>/Nói lại/.test(x.textContent));b.click()});await W(700);
ok(await active(),'micro vẫn mở sau khi bấm Nói lại');
ok(await E(()=>stage)==='answer','về bước trả lời');

console.log('Kịch bản 5: micro tự tắt sớm (Android) chưa kịp nói → tự mở lại');
await toQ1();const n5=await recN();
await E(()=>__sr._end());await W(1200);
ok((await recN())>n5&&await active(),'mở lại micro: '+(await recN()-n5)+' lần');

console.log('Kịch bản 6: không nghe thấy gì (no-speech) → nhắc nói lại và nghe tiếp');
await toQ1();await E(()=>__sr.err('no-speech'));await W(1300);
ok(await active(),'nghe lại sau lời nhắc');
ok(await E(()=>__spoken.slice(-1)[0])&&/chưa nghe rõ/.test(await E(()=>__spoken.slice(-1)[0])),'có nhắc bà nói lại');

console.log('Kịch bản 7: gõ chữ khi micro đang nghe');
await toQ1();await E(()=>{$('txt').value='Váy xòe';sendTyped()});await W(300);
ok((await lastMe())==='Váy xòe','nhận chữ gõ');
const dup=await E(()=>[...document.querySelectorAll('.b.me')].filter(x=>x.textContent==='Váy xòe').length);
ok(dup===1,'không bị gửi 2 lần');

console.log('Kịch bản 8: bấm nút tròn khi đang nghe → chốt câu đang nói');
await toQ1();await E(()=>__sr.emit([['màu đỏ',false]]));await W(50);
await E(()=>chatPress());await W(200);
ok((await lastMe())==='Màu đỏ','dùng câu đang nói dở: '+await lastMe());

console.log('Kịch bản 9: lỗi start (micro cũ chưa tắt hẳn) → thử lại');
await toQ1();await E(()=>{window.__busy=true;rec&&(rec._abort=true);rec=null});
await E(()=>{listen();setTimeout(()=>window.__busy=false,200)});await W(900);
ok(await active(),'vẫn bật được micro');

console.log('Kịch bản 10: lỗi mạng → báo rõ, không lặp');
await toQ1();const n10=await recN();await E(()=>__sr.err("network"));await W(1500);
ok((await recN())-n10<=1,'không mở lại liên tục');


console.log('Kịch bản 11: bấm "Bỏ qua câu này" khi đang nghe');
await toQ1();await E(()=>{const b=[...document.querySelectorAll('#quick button')].find(x=>/Bỏ qua/.test(x.textContent));b.click()});
await E(()=>{const r=window.__recs[window.__recs.length-1];if(!r.ended&&r._abort!==true)r.emit([['tiếng lạ',true]])});
ok(await until(()=>qi===1&&!!rec&&stage==='answer'),'sang câu 2 và nghe tiếp');
ok(!/tiếng lạ/i.test(await lastMe()),'không nhận tiếng lạ');

console.log('Kịch bản 12: máy tự kết thúc ngay sau câu cuối (Android thật) → chỉ nhận 1 lần');
await toQ1();await E(()=>{__sr.emit([['giá 200 nghìn',true]]);__sr._end()});
await until(()=>stage==='confirm');await W(2200);
const cnt=await E(()=>[...document.querySelectorAll('.b.me')].filter(x=>x.textContent==='Giá 200 nghìn').length);
ok(cnt===1,'chỉ nhận 1 lần (đếm '+cnt+')');

console.log('Kịch bản 13: nói "dạ đúng rồi bà" / "không phải" ở bước xác nhận');
await toQ1();await E(()=>{__sr.emit([['màu xanh',true]]);__sr._end()});await until(()=>!!rec&&stage==='confirm');
await E(()=>{__sr.emit([['không phải',true]]);__sr._end()});
ok(await until(()=>!!rec&&stage==='answer'),'"không phải" → hỏi lại');
await E(()=>{__sr.emit([['màu vàng',true]]);__sr._end()});await until(()=>!!rec&&stage==='confirm');
await E(()=>{__sr.emit([['dạ đúng rồi bà',true]]);__sr._end()});
ok(await until(()=>qi===1),'"dạ đúng rồi bà" → lưu và sang câu 2');
ok(await E(()=>answers[0])==='Màu vàng','lưu đúng: '+await E(()=>answers[0]));

console.log('Kịch bản 14: câu hỏi giá, bà đọc bằng chữ → ra số gọn');
await E(()=>{stopAll();answers=QUESTIONS.map(()=>'');qi=1;$('msgs').innerHTML='';nextQuestion()});await until(()=>!!rec&&stage==='answer');
await E(()=>{__sr.emit([['một trăm năm mươi nghìn',true]]);__sr._end()});await until(()=>stage==='confirm');
ok((await lastMe())==='150k','giá: '+await lastMe());
await E(()=>{stopAll();qi=3;nextQuestion()});await until(()=>!!rec&&stage==='answer');
await E(()=>{__sr.emit([['năm lăm ký đến sáu lăm ký',true]]);__sr._end()});await until(()=>stage==='confirm');
ok((await lastMe())==='55kg đến 65kg','size: '+await lastMe());

console.log('Kịch bản 15: bấm "Nói lại" ở câu hỏi màu rồi nói (lỗi anh Đạt gặp)');
await E(()=>{stopAll();qi=2;nextQuestion()});await until(()=>!!rec&&stage==='answer');
await E(()=>{__sr.emit([['đỏ',true]]);__sr._end()});await until(()=>!!rec&&stage==='confirm');
await E(()=>[...document.querySelectorAll('#quick button')].find(x=>/Nói lại/.test(x.textContent)).click());
ok(await until(()=>!!rec&&stage==='answer'),'micro mở, sẵn sàng nghe');
await E(()=>{__sr.emit([['đỏ, xanh và vàng',true]]);__sr._end()});
ok(await until(()=>stage==='confirm'),'đã nhận lời nói mới');
ok((await lastMe())==='Đỏ, xanh, vàng','màu: '+await lastMe());

console.log(errs.length?'Lỗi trang: '+errs.join(' | '):'Không có lỗi JS');
console.log(fails?`=> ${fails} lỗi`:'=> TẤT CẢ ĐẠT');
await b.close()})();
