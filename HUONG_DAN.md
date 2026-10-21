# Hướng dẫn: Dashboard công việc + đồng bộ Odoo

## Gồm những gì
- `po-dashboard/index.html`: giao diện dashboard, đưa lên GitHub Pages (công khai, không chứa dữ liệu).
- `po-data/`: kho dữ liệu **riêng tư**: file Excel `data/PO-data.xlsx`, `data/history.json` (lịch sử thao tác, dashboard tự tạo), `scripts/sync_odoo.py`, `scripts/config.json` và workflow `.github/workflows/sync-odoo.yml`.

## Tính năng của dashboard
- Tự động lưu sau khi sửa, thêm, xóa hoặc nhập file (có ô “Tự động lưu” để tắt). Hoạt động khi đã kết nối GitHub, hoặc khi chọn file bằng nút “Chọn file Excel” trong Chrome/Edge và cho phép ghi file.
- Di chuột vào dòng nào thì dòng đó sáng lên; nút 🗑 cuối dòng để xóa bản ghi.
- Tab “🕘 Lịch sử”: mọi lần sửa, thêm, xóa, nhập file đều được ghi lại và có nút “Khôi phục”.
- Tab “⚠ Ưu tiên xử lý”: đơn quá hạn xếp theo mức Khẩn, Cao, Sắp đến hạn.
- Nút “⬆ Nhập file Odoo”: gộp file xuất tay từ Odoo theo Mã đơn hàng, giữ nguyên cột Note.

## Bước 1. Hai repo trên GitHub (tài khoản Donniehieu)
1. `po-dashboard` (**Public**): tải `index.html` lên. Settings, Pages, nhánh `main`, thư mục `/ (root)`. Trang sẽ ở `https://donniehieu.github.io/po-dashboard/`.
2. `po-data` (**Private**): có đủ `data/PO-data.xlsx`, `scripts/sync_odoo.py`, `scripts/config.json` và `.github/workflows/sync-odoo.yml` (tạo file bằng Add file, Create new file, gõ đúng đường dẫn rồi dán nội dung từ `workflow-copy-vao-.github-workflows/sync-odoo.yml`).

## Bước 2. API key Odoo
Đăng nhập Odoo, bấm ảnh đại diện, **Tùy chọn (Preferences)**, **Bảo mật tài khoản (Account Security)**, **Khóa API mới**. Chép khóa ngay vì chỉ hiện một lần. Không gửi khóa này cho ai.

## Bước 3. Khai Secrets cho repo `po-data`
Settings, Secrets and variables, Actions, New repository secret. Tạo 4 Secret (tên viết đúng từng chữ):

| Name | Giá trị |
|---|---|
| `ODOO_URL` | `https://erp.dekko.com.vn` (không thêm đường dẫn phía sau) |
| `ODOO_DB` | tên cơ sở dữ liệu |
| `ODOO_LOGIN` | tên đăng nhập Odoo (thường là email) |
| `ODOO_API_KEY` | khóa API ở bước 2 |

Tìm tên cơ sở dữ liệu: đăng nhập Odoo, bấm F12, chọn Console, dán lệnh sau rồi Enter:
```
fetch('/web/session/get_session_info',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',method:'call',params:{}})}).then(r=>r.json()).then(j=>console.log('DB =',j.result.db))
```
Không tìm được thì bỏ trống `ODOO_DB`: script tự dò, nếu không dò được sẽ báo rõ để bạn nhờ IT.

## Bước 4. Chạy thử (chỉ đọc, không ghi gì)
1. Repo `po-data`, thẻ **Actions**, chọn “Đồng bộ đơn mua từ Odoo”, **Run workflow**, **tích ô “Chạy thử”**, bấm nút xanh Run workflow.
2. Đợi khoảng 1 phút, bấm vào dòng chạy mới nhất, bấm **sync**, mở bước “Đồng bộ và đẩy lên repo” để đọc log.
3. Log đúng sẽ có dạng:
```
- CÔNG TY TNHH THIẾT BỊ ĐIỆN NƯỚC PHÚC HÀ: … đơn
- CÔNG TY TNHH MỘT THÀNH VIÊN NHỰA PHÚC HÀ DUNG QUẤT: … đơn
Kết quả: cập nhật … dòng, thêm … dòng, không đổi … dòng
(--probe: không ghi file)
```
4. Đối chiếu: số đơn từng công ty khớp màn hình Odoo của bạn (cùng bộ lọc bạn vẫn dùng); “thêm … dòng” là các đơn đang có trên Odoo mà Excel chưa có; dòng “nhãn Odoo chưa từng có trong Excel” nên là “không”.
5. Khi số liệu khớp, chạy lại **không tích “Chạy thử”** để ghi thật. Sau đó workflow tự chạy 5 lần mỗi ngày làm việc (8h, 10h, 12h, 14h, 16h giờ Việt Nam).

### Tên công ty trong `scripts/config.json`
Mục `companies` đang là hai công ty của bạn:
- `CÔNG TY TNHH THIẾT BỊ ĐIỆN NƯỚC PHÚC HÀ` (TBDN Phúc Hà)
- `CÔNG TY TNHH MỘT THÀNH VIÊN NHỰA PHÚC HÀ DUNG QUẤT` (Phúc Hà Dung Quất)

Script khớp tên không phân biệt hoa thường. Nếu báo không tìm thấy công ty, log sẽ in ra danh sách công ty tài khoản bạn truy cập được; chép đúng tên vào `config.json` (mở file trên GitHub, bấm biểu tượng bút chì, sửa, Commit changes).

### Nếu số đơn lệch hơn Odoo (ví dụ log 127 đơn nhưng màn hình Odoo chỉ có 124)
Script lấy mọi đơn có Người mua là bạn, nên có thể gồm cả đơn **đã hủy** hoặc báo giá nháp mà màn hình Odoo đang ẩn. Từ bản này, log in thêm dòng “Tất cả đơn của bạn theo trạng thái trên Odoo: {…}” cho từng công ty, và mặc định bỏ đơn đã hủy (`"exclude_states": ["cancel"]` trong `config.json`). Cách đối chiếu: cộng số đơn các trạng thái bạn đang thấy trên màn hình Odoo, so với số script lấy. Nếu muốn bỏ thêm loại nào (ví dụ báo giá nháp `draft`), thêm mã trạng thái vào `exclude_states`: `draft` báo giá, `sent` báo giá đã gửi, `to approve` chờ duyệt, `purchase` đơn mua, `done` đã khóa, `cancel` đã hủy. Đơn đã bị xóa hẳn khỏi Odoo thì không bao giờ xuất hiện.

### Nếu số đơn vẫn lệch
Bộ lọc của trang `action-1572` có thể khác mặc định của script (mặc định chỉ lấy đơn có Người mua là bạn). Mở `scripts/config.json` và chỉnh mục `domain` cho khớp bộ lọc trên Odoo.

## Bước 5. Kết nối dashboard
1. Tạo mã truy cập GitHub: Settings (tài khoản), Developer settings, Fine-grained tokens, chọn **chỉ repo `po-data`**, quyền Contents = Read and write, Actions = Read and write.
2. Mở dashboard, “⚙ GitHub”, điền `Donniehieu`, `po-data`, `data/PO-data.xlsx`, `main` và dán mã, “Lưu & tải dữ liệu”. Mã chỉ lưu trong trình duyệt đó.

## Lỗi thường gặp trong log
| Thông báo | Cách xử lý |
|---|---|
| `can't open file … scripts/sync_odoo.py` | Chưa upload thư mục `scripts` vào đúng gốc repo `po-data`. |
| `Thiếu biến môi trường/Secrets` | Thiếu hoặc gõ sai tên Secret. |
| `Đăng nhập Odoo thất bại` | Sai `ODOO_DB`, `ODOO_LOGIN` hoặc `ODOO_API_KEY`. |
| `Không tìm thấy công ty …` | Xem danh sách trong log, sửa `companies` trong `config.json`. |
| Lỗi kết nối, hết thời gian chờ | GitHub không vào được ERP (ERP chỉ mở trong mạng nội bộ/VPN). Dùng nút “Nhập file Odoo”. |
| Dashboard: “Không tìm thấy file trên GitHub” | Kiểm tra tên repo, đường dẫn file, tên nhánh (`main` hay `master`) và token có chọn đúng repo. |

## Lưu ý
- Script chưa được thử với ERP thật của bạn khi viết; bước 4 chính là phép thử đầu tiên.
- Mỗi lần đồng bộ ghi đè các cột lấy từ Odoo; cột Note và các sheet khác được giữ nguyên.
- Dashboard không ghi ngược vào Odoo. Các lần đồng bộ tự động từ Odoo nằm trong lịch sử commit của repo `po-data`.
- Nhắc việc bằng thông báo trình duyệt chỉ hiện khi trang đang mở.
- Không đưa file Excel hay API key vào repo công khai.

---

## Tự động tải dữ liệu từ Odoo + thông báo

Odoo không tự "báo" được cho GitHub khi có thay đổi, nên có 3 lớp cùng chạy:

1. GitHub Actions tự đồng bộ **15 phút/lần**, 8h–18h giờ Việt Nam, thứ Hai–thứ Sáu (GitHub có thể trễ vài phút).
2. Khi **mở dashboard**, nếu lần đồng bộ gần nhất đã quá 10 phút thì dashboard tự yêu cầu đồng bộ ngay (tắt bằng ô "Tự đồng bộ Odoo").
3. Khi dashboard đang mở, cứ **1 phút** kiểm tra; có dữ liệu mới thì tự tải lại (nếu bạn đang sửa dở, chờ lưu xong mới tải).

Thông báo: thành công → "✔ Đã tải dữ liệu mới từ Odoo lúc hh:mm: cập nhật X dòng, thêm Y dòng". Lỗi → thanh đỏ "Không đồng bộ được… cần làm thủ công" (xuất file từ Odoo rồi bấm ⬆ Nhập file Odoo), có nút "Xem chi tiết lỗi" và "Thử lại".

**Cách cập nhật:** (1) thay `index.html` ở repo po-dashboard; (2) thay file `.github/workflows/sync-odoo.yml` ở repo po-data bằng bản mới; (3) mã truy cập (token) cần quyền **Actions: Read and write** và **Contents: Read and write**.

Giới hạn: không phải tức thời (trễ tối đa ~15 phút); ngoài giờ làm việc chỉ đồng bộ khi bạn mở dashboard.

---

## Dùng trên điện thoại, giọng nói, tin nhắn nhắc việc, mở Odoo

- **Điện thoại:** giao diện tự co theo màn hình. Trên điện thoại chỉ cần **chạm** vào ô để sửa (máy tính: bấm đúp). Mẹo: mở trang bằng Chrome/Safari rồi chọn "Thêm vào màn hình chính" để dùng như app.
- **Nhập bằng giọng nói:** khi sửa một ô văn bản, bấm nút 🎤 cạnh ô rồi nói tiếng Việt. Cần Chrome/Edge/Safari và cho phép micro; Firefox không hỗ trợ.
- **Tin nhắn nhắc việc:** nút chuông 🔔 nổi góc phải dưới, số đỏ là số đơn trễ hẹn. Mỗi đơn là một tin, có nút Tìm trên Odoo, 🎤 Ghi chú (đọc xong được thêm vào cột Note kèm ngày, kiểm tra lại chữ rồi mới lưu), Xem dòng, và ✕ (ẩn đến hết hôm nay).
- **Mở Odoo:** bấm mã đơn (chữ xanh gạch chân) ở bảng, tab Ưu tiên hoặc tin nhắn. Dashboard mở Odoo và sao chép sẵn mã đơn; bạn chỉ cần dán vào ô tìm kiếm và chọn đúng công ty. Odoo không cho điền sẵn ô tìm kiếm qua đường dẫn nên không làm tự động hơn được.
