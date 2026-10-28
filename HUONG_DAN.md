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

**Cập nhật: mở đúng PO.** Lần đồng bộ Odoo chạy xong sẽ tạo file `data/odoo-ids.json` (mã PO → id bản ghi trên Odoo). Khi đó bấm mã PO sẽ mở thẳng form của PO đó. PO chưa có trong file này sẽ mở danh sách Odoo và sao chép mã để dán tìm kiếm.

**Cập nhật: đồng bộ cả việc xóa.** Đơn đã xóa hoặc hủy trên Odoo sẽ bị xóa khỏi Excel ở lần đồng bộ sau. An toàn: (1) bản sao các dòng bị xóa (kể cả cột Note) lưu ở `data/deleted-log.json`; (2) nếu Odoo trả về 0 đơn, hoặc số dòng sắp xóa vượt 20% (tối thiểu 5), script không xóa mà báo cảnh báo trong log; (3) tắt tính năng bằng `"delete_missing": false` trong `scripts/config.json`. Lưu ý: dòng bạn tự thêm tay vào sheet PO mà không có trên Odoo cũng sẽ bị xóa.

---

## Quy trình trạng thái PO (cột Note), bộ lọc, ưu tiên mới

- **Cột “TT trước”** (đầu bảng PO) là ô **chỉ xem, không tick tay được**: do code tự đặt theo Phân loại của NCC ở tab DS NCC. Có tick = PO thanh toán trước (12 bước, có Chờ làm TT / Chờ gửi UNC / Đã gửi UNC); không tick = thanh toán công nợ (12 bước, có Chờ làm TT, Chờ gửi UNC, Đã gửi UNC trước Hoàn thành: Odoo báo đã nhận hết + đã xuất hóa đơn thì tự sang Chờ làm TT; có PAY đã thanh toán (BNK) khi đang ở Chờ làm TT thì tự sang Hoàn thành; BNK đến sớm hơn thì PO tự nâng lên Chờ gửi UNC, cả đơn trả trước lẫn công nợ). Muốn đổi, hãy sửa Phân loại của NCC ở tab DS NCC.
- **Nút ◀ ▶ cạnh Note**: lùi/tiến một bước theo luồng, ghi thẳng vào cột Note. Vẫn có thể bấm đúp để gõ trạng thái khác; trạng thái tự nhập nằm ngoài luồng (bấm ▶ sẽ về bước đầu).
- **Note trống**: lấy theo Odoo khi đồng bộ (Dự thảo + chưa có phiếu nhập → Chờ báo giá; Đã phê duyệt + Chưa nhận → Chờ gửi NCC; còn lại → Chờ báo giá). Note đã có thì luôn giữ nguyên.
- **Bộ lọc**: bấm ▾ ở tiêu đề cột; có thể chọn “chứa/không chứa/bằng/…”, 2 điều kiện nối VÀ/HOẶC và danh sách giá trị; nhiều cột lọc cùng lúc.
- **Cần chạy 🔄 Đồng bộ Odoo một lần** sau khi thay file để script thêm 3 cột mới vào Excel: “Trạng thái quy trình”, “Thanh toán trước”, “Ghi chú”.
- **Micro bị chặn:** làm theo thông báo hiện ra (thường: mở bằng Chrome/Safari thay vì Zalo/Messenger; cho phép micro ở biểu tượng ổ khóa).
- Danh sách việc cần xác nhận và đề xuất: xem `TODO.md`.

---

## Đợt 2: tính năng mới

**Cập nhật file:**
- Repo po-dashboard: thay `index.html`; thêm `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png` (để cài lên điện thoại); thư mục `tests/` là tùy chọn.
- Repo po-data: thay `scripts/sync_odoo.py`, `scripts/config.json`, `.github/workflows/sync-odoo.yml`.
- Bấm "🔄 Đồng bộ Odoo" một lần để script thêm hai cột mới: “Ngày đổi trạng thái”, “Ngày cam kết giao”.

**Cài lên điện thoại:** mở trang GitHub Pages bằng Chrome (Android) hoặc Safari (iPhone) → menu → “Thêm vào màn hình chính / Cài đặt ứng dụng”.

**Mở nhanh:** lần đầu tải từ GitHub, các lần sau hiện ngay bản đã lưu rồi cập nhật nền (thanh trên cùng ghi “Bản lưu trong máy, đang cập nhật…”). Trong vài giây đó chưa sửa được để tránh ghi đè.

Toàn bộ trạng thái làm được / chưa làm được: xem `TODO.md`.

**Gợi ý Hoàn thành:** PO mà Odoo báo “Đã nhận hết” và “Đã xuất hóa đơn” sẽ hiện nút 💡; có nút “Đặt Hoàn thành tất cả” phía trên bảng.

---

## Tùy chọn: Odoo báo thay đổi tức thời (Cloudflare Worker miễn phí)

Luồng: Odoo (Automation) → Cloudflare Worker (miễn phí) → GitHub `repository_dispatch` → workflow đồng bộ chạy ngay. Nếu bất kỳ khâu nào hỏng hoặc Worker hết hạn mức, đồng bộ theo lịch 15 phút/lần trên GitHub vẫn chạy như hiện tại, không cần chuyển gì.

**Bước 0 – kiểm tra quyền Odoo của bạn:** đăng nhập Odoo, bấm F12 → tab Console, dán:
`fetch('/web/session/get_session_info',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',method:'call',params:{}})}).then(r=>r.json()).then(j=>console.log('is_admin:',j.result.is_admin,'is_system:',j.result.is_system))`
Nếu `is_system: true` thì bạn đủ quyền tạo Automation. Nếu `false`, hãy nhờ quản trị viên Odoo làm bước 3.

**Bước 1 – Cloudflare:** Workers & Pages → Create → Hello World → dán nội dung `relay/cloudflare-worker.js` → Deploy. Settings → Variables and Secrets: thêm `GITHUB_TOKEN`, `SHARED_SECRET`, `REPO` (xem chú thích đầu file).
**Bước 2 – repo po-data** đã có sẵn trigger `odoo-change` trong `sync-odoo.yml`.
**Bước 3 – Odoo:** bật chế độ nhà phát triển → Settings → Technical → Automation Rules → tạo quy tắc trên model Purchase Order, kích hoạt “On Create and Edit” (nên thêm điều kiện chỉ PO của bạn), hành động “Send Webhook Notification”, URL: `https://<tên-worker>.workers.dev/?k=<SHARED_SECRET>`. Tên menu và hành động tùy phiên bản Odoo, mình chưa kiểm chứng được trên Odoo của bạn.

---

## Đồng bộ mỗi 15 phút (không cần quyền quản trị Odoo)

`sync-odoo.yml` chạy 15 phút/lần, 8h–18h, thứ Hai–thứ Sáu. Cần thêm file `requirements.txt` (nội dung: `openpyxl`) ở thư mục gốc repo po-data để bật cache thư viện. Hạn mức Actions của repo riêng tư gói Free là 2.000 phút/tháng (hãy xem lại ở GitHub → Settings → Billing and plans): mỗi lần chạy nên dưới 1 phút (xem cột thời gian trong tab Actions); nếu hay quá 1 phút thì đổi `*/15` thành `*/30`.

### Tự động đồng bộ danh sách NCC (tab "DS NCC")
Mỗi lần đồng bộ Odoo (15 phút/lần hoặc bấm nút đồng bộ), hệ thống tự làm thêm:
1. **NCC mới ở tab PO → tự thêm vào tab DS NCC** (Tên NCC = đúng tên trên Odoo, STT kế tiếp). Cột **Phân loại của DS NCC để trống** vì không thể biết NCC đó là "Đơn hàng" hay "Công nợ" - bạn chọn tay một lần.
2. **Phân loại = "Đơn hàng" → tick "Thanh toán trước" cho mọi PO của NCC đó; Phân loại = "Công nợ" → bỏ tick mọi PO của NCC đó** (kể cả PO đã tick tay). Áp dụng ở mọi lần đồng bộ và ngay khi bạn mở file/sửa DS NCC/nhập file Odoo trong dashboard; không tick tay được (sửa tay trong Excel cũng bị đưa về đúng ở lần đồng bộ kế tiếp). PO "Hoàn thành" không bị đổi; NCC có Phân loại trống thì giữ nguyên.
3. So khớp tên bỏ qua dấu/hoa thường/loại hình công ty, bỏ mã đầu dòng (XHN-, XHCM-, X-...) và ghi chú hàng hóa sau " - ". Cặp khớp gần đúng và NCC khớp nhầm nhiều dòng được in trong log Actions ("~ khớp gần đúng", "! ... không tự tích") để bạn kiểm tra.

### Thanh chức năng trên đầu mỗi bảng & chỉnh độ rộng cột
- Ngay trên đầu bảng của mỗi tab sheet có: ＋ Thêm dòng · 🗑 Xóa dòng đã chọn · ⬆ Nhập Excel · ⬇ Xuất Excel · ⬇ Xuất CSV · ↔ Đặt lại độ rộng cột. Muốn xóa nhiều dòng: tick ô ở cột đầu của các dòng rồi bấm "Xóa dòng đã chọn".
- Kéo mép phải tiêu đề cột để đổi độ rộng (bấm đúp = tự vừa nội dung). Độ rộng được nhớ theo từng tab trên trình duyệt này.
- Sửa Phân loại của một NCC trong tab DS NCC thành "Đơn hàng" → tất cả PO của NCC đó tự được tick "TT trước" ngay; thành "Công nợ" → tự bỏ tick. Cột "Ngày điều chỉnh" tự điền ngày hôm nay khi Phân loại hoặc Ghi chú bị sửa.

### Ẩn cột, cột mới ở DS NCC
- Nút **👁 Chọn cột hiển thị** trên đầu mỗi bảng để ẩn/hiện cột (chỉ đổi cách xem). Cột đang ẩn hiện thành thanh "Cột đang ẩn: ＋ tên cột" phía trên bảng - bấm ＋ để hiện lại từng cột hoặc "Hiện tất cả". Tab PO không còn cột "Ngày cam kết giao".
- Tab DS NCC có cột: STT · Tên NCC · **Phân loại** (Đơn hàng/Công nợ) · **Ngày điều chỉnh** (tự điền khi sửa Phân loại hoặc Ghi chú) · **Ghi chú** · Trạng thái · Phát sinh công nợ. Đổi tên/thêm cột trong Excel do script đồng bộ làm ở lần chạy kế tiếp (sau khi bạn upload script mới).

---

## Lưu trữ riêng, không dùng GitHub (tránh quá tải GitHub, giữ dữ liệu riêng tư)

Dashboard có 3 nơi lưu; mỗi lần chỉ làm việc trên một nơi:

1. **GitHub** (nút ⚙ GitHub): như cũ, dùng cho PO-data và đồng bộ Odoo.
2. **Trên máy của bạn** (Chrome/Edge): bấm *Chọn file Excel* một lần; sửa xong tự ghi vào chính file đó. Lần sau bấm **📁 Mở lại file trên máy** (trình duyệt hỏi cho phép đọc/ghi). Muốn đồng bộ giữa nhiều máy thì để file trong thư mục OneDrive/Google Drive for desktop/Dropbox. Trình duyệt khác (Firefox, Safari, điện thoại) không ghi trực tiếp được, chỉ tải về bản `_da-cap-nhat.xlsx`.
3. **Cloud riêng = Google Drive của bạn** (nút ☁ Cloud riêng), cài một lần:
   1. Vào script.google.com → Dự án mới → dán toàn bộ `cloud/apps-script.gs` vào Code.gs.
   2. Bên trái bấm **Dịch vụ (+)** → thêm **Drive API** (v3).
   3. Cài đặt dự án → *Thuộc tính tập lệnh* → thêm `KEY` = chuỗi bí mật bạn tự đặt (nên đặt, ai có link nhưng không có KEY sẽ không đọc/ghi được).
   4. Triển khai → Ứng dụng web → Thực thi bằng *Tôi*, Ai có quyền truy cập *Bất kỳ ai* → Triển khai → cấp quyền → sao chép địa chỉ `…/exec`.
   5. Trong dashboard: ☁ Cloud riêng → dán địa chỉ và KEY → *Lưu & tải dữ liệu* (cloud còn trống thì thông báo). Mở file Excel trên máy rồi bấm **☁ Đẩy lên cloud riêng** để nạp lần đầu.
   - File nằm trong Google Drive của bạn dạng .xlsx (mở được bằng Google Sheets, Drive giữ các phiên bản cũ). Nó **không phải** Google Sheet đồng bộ theo từng ô.
   - Ghi đè an toàn: nếu nơi khác vừa sửa file trên cloud, dashboard báo và yêu cầu Tải lại thay vì ghi đè.
   - Không có đồng bộ Odoo trên cloud riêng (việc đó chỉ chạy với PO-data trên GitHub). Lịch sử thao tác chỉ lưu trong trình duyệt.


## Phiếu thanh toán NCC (tab "Phiếu thanh toán")

Theo dõi các phiếu thanh toán nhà cung cấp (trang Odoo `…/odoo/vendor-payments`, số `PAY…`) đã thanh toán chưa, và nhắc kế toán khi quá hạn.

### Dữ liệu từ đâu ra
- Script đồng bộ Odoo (15 phút/lần, cùng workflow với PO) đọc phiếu của **chính bạn lập** (`create_uid`) ở 2 công ty trong `scripts/config.json` và ghi vào sheet **"Phiếu thanh toán"** của `data/PO-data.xlsx`. Sheet tự được tạo; tab chỉ hiện trong dashboard khi sheet đã có trong file.
- Muốn lấy cả phiếu của đồng nghiệp: bỏ điều kiện `["create_uid", "=", "{uid}"]` trong `pay_sync.domain` (sẽ khoảng 1.300 phiếu).
- Lỗi ở bước PAY không làm hỏng đồng bộ PO. Log Actions có dòng `PAY: n phiếu (… mới, … quá hạn cần nhắc KT, …)`.
- Chạy thử không ghi: Actions → "Đồng bộ đơn mua từ Odoo" → Run workflow → "Chạy thử" (probe).

### Các trạng thái
| Nhãn | Ý nghĩa |
|---|---|
| Chưa thanh toán | Odoo ở Nháp hoặc Đã duyệt (số vẫn là `PAY…`) |
| Đã thanh toán | Odoo ở `paid`, số đã đổi thành `…/BNK…` (`DQ/` = Dung Quất, `PH/` = Phúc Hà) |
| Đã hủy | Phiếu bị hủy, giữ dòng để đối chiếu, không nhắc |
| ⚠ Kiểm tra | Số đã là BNK nhưng Odoo chưa báo đã thanh toán: bạn xem lại phiếu, không nhắc |
| ⚠ Không còn trên Odoo | Phiếu chưa thanh toán biến mất khỏi Odoo, giữ dòng, không nhắc |

Khóa của mỗi dòng là **ID Odoo** (2 cột kỹ thuật "ID Odoo", "Mã công ty" bị ẩn trong dashboard, đừng xóa trong Excel). Cột **Số PAY** giữ số ban đầu, **Số chứng từ hiện tại** đổi sang BNK khi đã thanh toán.

### Quá hạn và nhắc kế toán
- Hạn thanh toán = ngày lập PAY (lập T7/CN thì hạn là thứ Hai kế tiếp). Qua **≥ 1 ngày làm việc (T2–T6)** mà chưa thanh toán là quá hạn. Ví dụ: lập T2 → nhắc từ T3; lập T6 → nhắc từ T2. Ngưỡng đổi ở `pay_sync.overdue_days`.
- Phiếu quá hạn được script điền sẵn vào cột **"Nhắc KT thanh toán"**, đồng thời hiện trong hộp 🔔, banner đầu trang và tab Ưu tiên. Khi phiếu thành BNK, nội dung nhắc đổi thành `Đã TT: <số BNK>`.
- Cách nhắc kế toán: trong hộp 🔔 bấm **📋 Sao chép nhắc KT**, mở phiếu bằng **🔍 Mở phiếu trên Odoo**, dán vào ô *Gửi tin* của Chatter (chọn Ghi chú/Gửi tin nội bộ, **bỏ chế độ email**) và @tag kế toán. Muốn tự chèn tên kế toán vào đầu nội dung, điền `pay_sync.accountant_tag` trong `config.json`. Tự đăng tin vào Chatter chưa làm (cần quyền ghi `mail.message`).

### Cách dùng trong dashboard
- **Bấm đúp một dòng → mở phiếu trên Odoo.** Riêng cột *Ghi chú* bấm đúp vẫn là sửa; ghi chú của bạn được giữ nguyên qua các lần đồng bộ, cũng như mọi cột lạ bạn tự thêm.
- Dùng bộ lọc ▾, ẩn cột, xuất Excel như các tab khác.
- Ở tab **PO**, cạnh trạng thái Note có huy hiệu: `PAY… · chờ TT` (vàng), `PAY… · quá hạn N ngày` (đỏ), `…/BNK… ✔` (xanh), hủy/không còn trên Odoo (xám).

### Gắn PAY với PO
Cột **PO liên quan** lấy từ mã PO trong diễn giải (memo) của phiếu, và từ số PAY bạn ghi trong Note/Ghi chú của PO. Một PAY gộp nhiều PO thì liệt kê đủ. Memo kiểu "TT hóa đơn 1564" không có mã PO nên hãy ghi số PAY vào Ghi chú của PO để gắn được.

### Tự chuyển bước PO
Khi PAY thành BNK, PO **trả trước** (cột TT trước được tick) đang ở bước trước "Đã gửi UNC" tự chuyển sang **"Đã gửi UNC"** và ghi vào Ngày đổi trạng thái. Mỗi PAY chỉ xử lý một lần (nhớ trong `data/pay-state.json`), nên nếu bạn lùi PO lại thì nó không bị đẩy lên nữa. PO đã đi xa hơn hoặc không trả trước thì không đổi. Danh sách PO được chuyển in trong log Actions.

### Kiểm thử
`python tests/test_pay_sync.py` trong repo `po-data` (17 test dữ liệu giả; cần `openpyxl`, Windows thêm `pip install tzdata`).

### Giới hạn
- Chưa thử trên Odoo/GitHub thật lâu dài: nên chạy "Chạy thử" rồi theo dõi 2–3 ngày đầu, chú ý các phiếu ⚠ Kiểm tra.
- Chưa tự gửi nhắc ra Zalo/email và chưa tự đăng Chatter.


## Tab "Công nợ NCC" (tên cũ "DS NCC") và tab "Nhà cung cấp"
- Tab **Công nợ NCC** là danh sách gốc các NCC kèm Phân loại (Đơn hàng/Công nợ), Ghi chú. NCC mới xuất hiện ở tab PO được tự thêm vào (khi mở file, khi nhập Excel, và mỗi lần script đồng bộ chạy). File Excel cũ có sheet "DS NCC" sẽ tự được đổi tên ở lần đồng bộ kế tiếp.
- Tab **Nhà cung cấp** chỉ liệt kê NCC đang có PO ở tab PO nên thường ít hơn Công nợ NCC (danh sách gốc còn giữ NCC cũ và có thể có NCC ghi trùng). Dòng giải thích ở đầu tab nêu rõ các NCC chênh lệch.
- Nút **⬇ Xuất Excel** xuất danh sách đang hiện; **⬆ Nhập Excel** nhập vào Công nợ NCC (khớp theo cột *Tên NCC*, cập nhật *Phân loại* và *Ghi chú*, NCC chưa có thì thêm dòng). Xong bấm "Lưu vào Excel" (hoặc chờ tự lưu).

## Xóa dòng
Nút 🗑 ở mọi bảng xóa **hẳn dòng** khỏi file Excel khi lưu (các dòng dưới dồn lên) và đánh lại cột STT từ 1 đến hết. Dòng đã xóa có thể khôi phục trong tab Lịch sử (thành dòng mới ở cuối bảng). Riêng sheet có công thức/ô gộp/liên kết (vd. Bảng kê TT, Thông báo duyệt giá) chỉ xóa dữ liệu của dòng, không dồn dòng.

## Tab "Thông tin thanh toán" (ngân hàng, số tài khoản NCC)
- Tab hiện khi file Excel có sheet "Thông tin thanh toán" (script đồng bộ Odoo tự tạo ở lần chạy đầu, nạp sẵn từ `data/NCC-thong-tin-thu-huong-MAU.xlsx`).
- Tick ô **Đã kiểm tra thông tin** khi bạn đã đối chiếu xong; dòng đã tick không bị script đụng tới.
- NCC mới xuất hiện ở tab PO sẽ tự có thêm một dòng. Script tự lấy Ngân hàng và Số tài khoản từ liên hệ Odoo (tab Kế toán) vào ô còn trống, số tài khoản được chèn dấu "." sau ký tự thứ 5 nếu chưa có dấu "."; cột **Note** báo "Đã lấy từ Odoo…" hoặc "Odoo chưa có… - cần nhập tay". Không bao giờ ghi đè ô bạn đã nhập.
- Nhập/xuất: nút ⬆ Nhập Excel (khớp theo tên cột, dòng trùng Tên NCC được cập nhật) và ⬇ Xuất Excel/CSV ở thanh trên đầu bảng.

### Tự điền thụ hưởng lấy dữ liệu từ tab Thông tin thanh toán
Mở phiếu thanh toán Odoo **từ dashboard** (bấm đúp dòng ở tab Phiếu thanh toán). Khi bấm "Tự điền": NCC đã tick "Đã kiểm tra thông tin" ở tab Thông tin thanh toán được ưu tiên; không tick thì dùng dữ liệu đã nạp từ file Excel; file chưa có NCC đó thì dùng dữ liệu tab (thông báo ghi "CHƯA kiểm tra"). Odoo Helper nhớ bản dữ liệu gần nhất nên lần sau mở Odoo trực tiếp vẫn dùng được.

## Tab "Netsuite Data"
- Dữ liệu lưu trên GitHub dạng JSON nén `data/netsuite.json.gz` (nhỏ và mở nhanh; không nằm trong PO-data.xlsx vì quá lớn). Bấm tab **📊 Netsuite Data** (cuối thanh tab) để tải lần đầu. Nếu repo mới chỉ có file Excel `Netsuite_data.xlsx`, dashboard đọc file đó rồi hỏi có chuyển sang JSON nén không.
- Có tìm kiếm, lọc theo cột, ẩn/hiện cột, xuất Excel/CSV theo bộ lọc. Chỉ xem, không sửa từng ô.
- Cập nhật dữ liệu: bấm **⬆ Nhập Excel**, chọn file Netsuite mới. Toàn bộ dữ liệu cũ bị thay bằng file mới (dashboard tự chuyển sang JSON nén); chọn lưu lên GitHub để mọi máy cùng dùng, hoặc Hủy để chỉ dùng trên máy này.
- Netsuite Data được lưu sẵn trên máy và nạp ngầm khi mở dashboard, không tải lại từ GitHub mỗi lần. Muốn lấy bản mới nhất ngay (khi máy khác vừa cập nhật) bấm **↻ Làm mới từ GitHub** ở đầu bảng; ngoài ra dashboard tự kiểm tra âm thầm tối đa một lần mỗi ngày.

## Nhắn Zalo cho Thủ kho từ phiếu kho trên Odoo
Xem hướng dẫn cài đặt và sử dụng từng bước trong **HUONG_DAN_ZALO.md** (cần cập nhật script Tampermonkey lên 2.1.0 một lần).
