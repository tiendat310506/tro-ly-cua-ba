// Nhận ảnh + thông tin từ app "Trợ lý của bà": lưu vào Google Drive và báo qua Telegram cho Đạt.
const FOLDER_ID = '1kR5osueLznERDFxWGokiGM-B6ROA-RzU';
const P = PropertiesService.getScriptProperties();

// Chạy hàm này 1 lần để cấp quyền và kiểm tra thư mục
function kiemTra() { Logger.log(DriveApp.getFolderById(FOLDER_ID).getName()); }

// Sau khi nhắn 1 tin bất kỳ cho bot, chạy hàm này để lấy mã chat của anh
function layChatId() {
  const r = JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + P.getProperty('TG_TOKEN') + '/getUpdates').getContentText());
  const m = (r.result || []).map(u => u.message).filter(Boolean).pop();
  if (!m) { Logger.log('Chưa thấy tin nhắn nào. Anh nhắn cho bot 1 tin rồi chạy lại nha.'); return; }
  P.setProperty('TG_CHAT', String(m.chat.id));
  guiTelegram('✅ Đã kết nối! Từ giờ bà gửi hàng mới, em sẽ báo ở đây.', []);
  Logger.log('Đã lưu chat id: ' + m.chat.id);
}

function guiTelegram(text, blobs) {
  const token = P.getProperty('TG_TOKEN'), chat = P.getProperty('TG_CHAT');
  if (!token || !chat) return;
  const api = 'https://api.telegram.org/bot' + token + '/';
  if (!blobs.length) {
    UrlFetchApp.fetch(api + 'sendMessage', { method: 'post', payload: { chat_id: chat, text: text } });
    return;
  }
  for (let s = 0; s < blobs.length; s += 10) {           // Telegram cho tối đa 10 ảnh mỗi album
    const part = blobs.slice(s, s + 10), payload = { chat_id: chat };
    const media = part.map((b, i) => {
      payload['p' + i] = b;
      const m = { type: 'photo', media: 'attach://p' + i };
      if (s === 0 && i === 0 && text.length <= 1000) m.caption = text;
      return m;
    });
    payload.media = JSON.stringify(media);
    UrlFetchApp.fetch(api + 'sendMediaGroup', { method: 'post', payload: payload });
  }
  if (text.length > 1000) UrlFetchApp.fetch(api + 'sendMessage', { method: 'post', payload: { chat_id: chat, text: text } });
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const root = DriveApp.getFolderById(FOLDER_ID);
    const stamp = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH.mm');
    const ten = String(d.name || 'Sản phẩm').replace(/[\\/:*?"<>|]/g, '').slice(0, 60);
    const folder = root.createFolder(stamp + ' - ' + ten);
    const text = String(d.text || '');
    folder.createFile('thong-tin.txt', text, MimeType.PLAIN_TEXT);
    const blobs = (d.photos || []).map(function (p, i) {
      const blob = Utilities.newBlob(Utilities.base64Decode(p.data), p.type || 'image/jpeg', 'anh-' + (i + 1) + '.jpg');
      folder.createFile(blob);
      return blob;
    });
    let tg = 'off';
    try { guiTelegram(text, blobs); tg = 'ok'; } catch (err) { tg = String(err); }
    return out({ ok: true, url: folder.getUrl(), telegram: tg });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}
function doGet() { return out({ ok: true, ping: 'tro-ly-cua-ba' }); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
