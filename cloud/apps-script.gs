/**
 * Cloud riêng cho Dashboard PO – chạy trong Google Apps Script của CHÍNH BẠN.
 * File Excel (.xlsx) được lưu trong Google Drive của bạn, không đi qua GitHub hay máy chủ nào khác.
 *
 * Cài đặt (xem HUONG_DAN.md):
 * 1. script.google.com → Dự án mới → dán toàn bộ file này vào Code.gs.
 * 2. Dịch vụ (+) → thêm "Drive API" (phiên bản v3).
 * 3. Cài đặt dự án → Thuộc tính tập lệnh → thêm KEY = một chuỗi bí mật tự đặt (nên đặt).
 * 4. Triển khai → Ứng dụng web → Thực thi bằng: Tôi; Ai có quyền truy cập: Bất kỳ ai → Triển khai → cấp quyền.
 * 5. Dán địa chỉ Web App vào dashboard (nút “☁ Cloud riêng”) cùng khóa KEY.
 */
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const props_ = () => PropertiesService.getScriptProperties();
const json_ = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const authOk_ = k => { const s = props_().getProperty("KEY"); return !s || s === k; };
function file_() {
  const id = props_().getProperty("FILE_ID");
  if (!id) return null;
  try { const f = DriveApp.getFileById(id); return f.isTrashed() ? null : f; } catch (e) { return null; }
}
const ver_ = f => String(f.getLastUpdated().getTime());

function doGet(e) {
  if (!authOk_((e.parameter || {}).key)) return json_({ error: "auth" });
  const f = file_();
  if (!f) return json_({ empty: true });
  return json_({ name: f.getName(), version: ver_(f), content: Utilities.base64Encode(f.getBlob().getBytes()) });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    if (!authOk_(b.key)) return json_({ error: "auth" });
    if (b.action !== "put") return json_({ error: "action" });
    const blob = Utilities.newBlob(Utilities.base64Decode(b.content), XLSX_MIME, b.name || "du-lieu.xlsx");
    let f = file_();
    if (!f) {
      f = DriveApp.createFile(blob);
      props_().setProperty("FILE_ID", f.getId());
    } else {
      if (b.version && b.version !== ver_(f)) return json_({ conflict: true, version: ver_(f) });
      Drive.Files.update({ name: blob.getName() }, f.getId(), blob); // giữ nguyên file và link, Drive tự lưu các phiên bản cũ
      f = DriveApp.getFileById(f.getId());
    }
    return json_({ ok: true, version: ver_(f) });
  } catch (err) {
    return json_({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
