// Nhận ảnh + thông tin từ app "Trợ lý của bà" và lưu vào thư mục Google Drive của Đạt.
const FOLDER_ID = '1kR5osueLznERDFxWGokiGM-B6ROA-RzU';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const root = DriveApp.getFolderById(FOLDER_ID);
    const stamp = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH.mm');
    const ten = String(d.name || 'Sản phẩm').replace(/[\\/:*?"<>|]/g, '').slice(0, 60);
    const folder = root.createFolder(stamp + ' - ' + ten);
    folder.createFile('thong-tin.txt', String(d.text || ''), MimeType.PLAIN_TEXT);
    (d.photos || []).forEach(function (p, i) {
      const blob = Utilities.newBlob(Utilities.base64Decode(p.data), p.type || 'image/jpeg', 'anh-' + (i + 1) + '.jpg');
      folder.createFile(blob);
    });
    return out({ ok: true, url: folder.getUrl() });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}
function doGet() { return out({ ok: true, ping: 'tro-ly-cua-ba' }); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
