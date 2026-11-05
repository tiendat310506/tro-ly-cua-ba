const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/tro-ly-cua-ba/index.html');await p.waitForTimeout(300);
await p.evaluate(()=>{stage='menu';listen()});
for(let i=0;i<6;i++){await p.waitForTimeout(700);console.log(await p.evaluate(()=>JSON.stringify({rec:!!rec,toast:$('toast').style.display==='block'?$('toast').textContent:'',cap:$('caption').textContent,lbl:$('micLbl').textContent})))}
console.log('errs',errs);await b.close()})();
