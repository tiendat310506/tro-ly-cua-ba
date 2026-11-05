// Giả lập SpeechRecognition + speechSynthesis để test
window.__log=[];window.__recs=[];
class MockSR{constructor(){this.started=false;this.ended=false;window.__recs.push(this);window.__sr=this}
  start(){if(window.__busy)throw new DOMException('already started','InvalidStateError');
    if(this.started)throw new DOMException('already started','InvalidStateError');this.started=true;window.__busy=true;window.__log.push('start c='+this.continuous)}
  _end(){if(this.ended)return;this.ended=true;setTimeout(()=>{window.__busy=false;window.__log.push('end');this.onend&&this.onend()},20)}
  stop(){window.__log.push('stop');this._end()}
  abort(){window.__log.push('abort');this.onerror&&this.onerror({error:'aborted'});this._end()}
  // tiện ích test: results = [[text,isFinal],...]
  emit(results){const arr=results.map(([t,f])=>{const a=[{transcript:t,confidence:.9}];a.isFinal=f;return a});
    this.onresult&&this.onresult({resultIndex:window.__ri??0,results:arr})}
  err(e){this.onerror&&this.onerror({error:e});this._end()}}
window.SpeechRecognition=MockSR;window.webkitSpeechRecognition=MockSR;
const synth={speaking:false,cancel(){window.__said&&0},getVoices(){return[]},speak(u){window.__spoken=(window.__spoken||[]);window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),30)},addEventListener(){} ,onvoiceschanged:null};
Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});
