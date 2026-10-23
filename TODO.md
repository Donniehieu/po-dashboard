# TODO – Dashboard quản lý PO

Cập nhật: 22/10/2026. Ký hiệu: ✅ đã làm và đã test · 🟡 làm một phần / chưa kiểm chứng ngoài thực tế · ❌ chưa làm được (kèm lý do).

## Đợt 1 (đã hoàn tất)
- ✅ Quy trình trạng thái PO trong Note (2 luồng), nút ◀ ▶, cột tick "TT trước" đứng đầu.
- ✅ Note trống → tự điền theo Odoo; cột "Trạng thái quy trình"; bộ lọc kiểu Excel; ưu tiên Khẩn theo quy tắc đã chốt; PO Hoàn thành không bao giờ trễ.
- ✅ Hướng dẫn xử lý khi micro bị chặn (chưa biết nguyên nhân thật trên máy bạn, xem thông báo hiện ra).

## Đợt 2 – các mục trong TODO đã được đồng ý
### Tính năng
- ✅ **Ngày đổi trạng thái** (cột mới, lưu dạng chữ dd/mm/yyyy) + cảnh báo ⏱ "ở bước này N ngày" khi từ 5 ngày trở lên (hiện trong bảng và tab Ưu tiên). Ngưỡng 5 ngày đổi bằng `localStorage["qlcv:stuck"]`.
- ✅ **Chọn nhiều PO** rồi: tiến/lùi một bước, đặt trạng thái bất kỳ. (Đã gỡ nút tick/bỏ tick hàng loạt vì cột TT trước chỉ do code quyết định.)
- ✅ **Chế độ xem đã lưu** (bộ lọc + tìm kiếm + sắp xếp) theo từng sheet, lưu trong trình duyệt (không đồng bộ giữa các máy).
- ✅ **Xuất Excel (.xlsx)** theo bộ lọc, có định dạng ngày, dòng tiêu đề cố định và bộ lọc tự động.
- ✅ **Cột "TT trước" KHÔNG tick tay được** (ô tick bị khóa, chỉ hiển thị) - chỉ code tự đặt theo Phân loại của NCC ở tab DS NCC: "Đơn hàng" → TICK mọi PO của NCC đó (kể cả PO chưa tick); "Công nợ" → BỎ TICK mọi PO của NCC đó (kể cả PO đang tick). Cưỡng chế ở 4 thời điểm: (1) mở file trong dashboard, (2) sau khi sửa Phân loại/Tên NCC ở DS NCC, (3) sau khi "Nhập file Odoo", (4) mỗi lần script đồng bộ chạy (15 phút; sửa tay trong Excel cũng bị đưa về đúng). PO "Hoàn thành" không bị đổi; NCC có Phân loại trống hoặc khớp mơ hồ thì giữ nguyên tick hiện có. Đã thử: bỏ tick tay 3 PO của NCC "Đơn hàng" → script tick lại đủ 3.
- ✅ **Ẩn/hiện cột** ở mọi bảng: nút "👁 Cột" trên đầu bảng, chọn cột cần ẩn, nhớ theo từng tab trong trình duyệt (chỉ đổi cách xem, không xóa dữ liệu, xuất Excel vẫn đủ cột).
- ✅ **Bảng chọn cột đã ẩn**: nút "👁 Chọn cột hiển thị (đang ẩn N)" + thanh "Cột đang ẩn: ＋ tên cột … Hiện tất cả" ngay trên bảng, bấm ＋ là cột hiện lại.
- ✅ **Ngày điều chỉnh (DS NCC)** tự điền ngày hôm nay mỗi khi Phân loại hoặc Ghi chú của NCC đó bị sửa (cả ở dashboard lẫn script đồng bộ).
- ✅ **Bỏ cột "Ngày cam kết giao" ở tab PO** (dashboard không còn hiển thị/dùng nó để tính trễ; script không tự thêm lại, và tự xóa cột khỏi Excel nếu cột trống; nếu còn dữ liệu thì giữ lại và ghi chú trong log).
- ✅ **Tab DS NCC đổi cột**: "Note" → "Phân loại", "Ngày Check" → "Ghi chú", thêm cột "Ngày điều chỉnh" nằm giữa Phân loại và Ghi chú (script đồng bộ tự đổi tên/thêm cột trong file Excel ở lần chạy kế tiếp; dashboard đọc được cả tên cũ lẫn mới). Ngày điều chỉnh tự điền hôm nay khi bạn sửa Phân loại hoặc Ghi chú của NCC (cả trong dashboard lẫn khi script thấy bạn sửa trực tiếp trong Excel). Dữ liệu ngày cũ để trống, không bịa.
- ✅ **Đơn mua hàng + Chưa nhận → tối thiểu "Chờ gửi NCC"** (sửa lỗi: trước đây chỉ áp dụng khi Note trống nên PO có Note "Chờ duyệt" như POKDQ00237 không được nâng). Giờ PO có Trạng thái quy trình "Đơn mua hàng" (hoặc "Đã phê duyệt") và phiếu nhập kho "Chưa nhận" mà Note đang ở bước trước "Chờ gửi NCC" (Chờ báo giá, Chờ gửi duyệt PO, Chờ duyệt PO) thì được nâng thành "Chờ gửi NCC" — dashboard hiện ngay, script đồng bộ ghi vào cột Note. Bấm ◀ lùi xuống dưới mức tối thiểu thì báo lý do và không đổi.
- ✅ **PC: giữ chuột trái trên bảng rồi kéo trái/phải để bảng trôi theo** (thay cho thanh cuộn ngang); không kích hoạt bấm/sửa ô sau khi kéo; không áp dụng khi bấm vào ô nhập, nút, ô tick, tiêu đề cột. Trên điện thoại dùng vuốt như bình thường.
- ✅ **Bấm ▶/◀ không làm bảng nhảy**: giữ nguyên vị trí cuộn ngang/dọc của bảng và của trang; nút ▶ ◀ đứng trước nhãn trạng thái nên không dịch chỗ khi tên trạng thái dài/ngắn khác nhau (bấm liên tục tại một chỗ). Áp dụng cả khi tick TT trước, đặt Hoàn thành, thao tác hàng loạt và sửa ô.
- ✅ **Nâng Note theo phiếu nhập kho** (dashboard + script đồng bộ): "Đã nhận hết" mà Note đang ở bước trước "Cần lập hóa đơn" → thành "Cần lập hóa đơn"; "Đã nhận một phần" mà Note ở bước trước "Chờ nhận hàng" → thành "Chờ nhận hàng". Chỉ nâng, không hạ bước đã đi xa hơn (Chờ KT xác nhận, Hoàn thành…); Note tự do (vd. "PAY00598") giữ nguyên. Script ghi thẳng vào cột Note và đặt lại "Ngày đổi trạng thái", log in danh sách PO đã nâng; dashboard hiện ngay dấu * + chú thích. 🟡 Luồng thanh toán trước: PO đang "Chờ làm TT/Đã gửi UNC" mà hàng đã về cũng bị nâng theo đúng quy tắc bạn nêu; nếu không muốn thì báo để loại trừ.
- ✅ **Note tự điền "Chờ gửi NCC"**: PO có Trạng thái quy trình = "Đơn mua hàng" (hoặc "Đã phê duyệt") VÀ phiếu nhập kho = "Chưa nhận" thì Note trống được điền "Chờ gửi NCC" (cả ở dashboard và script đồng bộ). Note bạn đã nhập luôn được giữ nguyên.
- ✅ **Bấm tên NCC trong tab PO → tự lọc các PO của NCC đó** (hiện chip bộ lọc, bấm × để bỏ). Bấm đúp vào ô vẫn là sửa.
- ✅ **Ẩn tab "Thông báo duyệt giá" và "Nhà cung cấp dây đai"** khỏi dashboard (hằng `HIDE_SHEETS` trong index.html). 🟡 Chỉ ẩn, sheet vẫn còn trong file Excel; muốn xóa hẳn khỏi Excel thì xóa tay trong Excel.
- ✅ **Đồng bộ DS NCC ↔ PO** (đã kiểm tra bằng dữ liệu thật của bạn):
  - NCC mới xuất hiện ở tab PO → tự thêm 1 dòng vào tab DS NCC (Tên NCC = tên trên Odoo, STT kế tiếp, cột Note để trống vì không thể đoán Đơn hàng/Công nợ). Chạy ở **2 nơi**: script đồng bộ Odoo (mỗi 15 phút) và ngay trong dashboard khi mở file.
  - (Đã thay bằng mục "Cột TT trước không tick tay được" ở trên; cột Note của DS NCC nay tên là Phân loại.)
  - Đổi từ "Đơn hàng" sang "Công nợ" thì tự BỎ TICK mọi PO của NCC đó (theo yêu cầu mới).
  - So khớp tên bỏ dấu/hoa thường/loại hình công ty/mã đầu dòng (XHN-…)/ghi chú hàng hóa sau " - "; các cặp khớp gần đúng được in trong log Actions để kiểm tra.
- ✅ **Thanh chức năng đặt ngay trên đầu mỗi bảng** (mọi tab sheet): ＋ Thêm dòng · 🗑 Xóa dòng đã chọn (tick ô chọn ở cột đầu, xóa nhiều dòng một lần) · ⬆ Nhập Excel (khớp theo tên cột; có cột mã/tên thì cập nhật dòng trùng và thêm dòng mới, không có thì hỏi trước khi thêm vào cuối) · ⬇ Xuất Excel · ⬇ Xuất CSV · ↔ Đặt lại độ rộng cột. Đã gỡ các nút này khỏi thanh trên cùng.
- ✅ **Độ rộng cột chỉnh bằng tay** ở mọi bảng: kéo mép phải của tiêu đề cột (bấm đúp để tự vừa nội dung); nhớ theo từng file + tab trong trình duyệt; trên điện thoại (dạng thẻ) không áp dụng.
- 🟡 Giới hạn: độ rộng cột và chế độ xem lưu trong trình duyệt nên không đồng bộ giữa các máy. "Nhập Excel" ở tab PO không thay cho nút "Nhập file Odoo" trên thanh đầu trang (nút đó tự chọn đúng sheet và giữ nguyên cột Note/Ghi chú của bạn).
- ✅ **Script Tampermonkey tự điền thụ hưởng** trong phiếu thanh toán Odoo (thư mục `tampermonkey/`): file Excel mẫu, nạp Excel/JSON làm cơ sở dữ liệu, nút "Tự điền". 🟡 chưa thử được trên Odoo thật (chỉ thử trên trang giả lập có đúng id 3 ô); dữ liệu lưu trong trình duyệt, chưa đồng bộ với dashboard.
- ✅ **Tab Nhà cung cấp**: số PO, đang mở, trễ, chờ báo giá, trễ lâu nhất, giá trị đang mở; bấm để lọc sheet PO.
- ✅ **Ngày cam kết giao** (cột mới): nếu có thì dùng thay cho ngày dự kiến của Odoo để tính trễ/ưu tiên.
- ✅ Nút sáng/tối, phím tắt `/` để tìm.
- ✅ **Gợi ý Hoàn thành** khi Odoo báo "Đã nhận hết" VÀ "Đã xuất hóa đơn" (đúng nhãn trong file của bạn): nút 💡 ở từng PO và nút "Đặt Hoàn thành tất cả". Chỉ gợi ý, không tự đổi.
- ❌ **Zalo / email**: Zalo OA cần doanh nghiệp đăng ký và duyệt; email cần SMTP/secrets riêng. Chưa làm.
- 🟡 **Odoo gửi webhook để đồng bộ tức thời**: Odoo không gửi kèm token được cho GitHub nên cần một cầu nối. Đã viết sẵn `relay/cloudflare-worker.js` (chưa thử thực tế) và GitHub đã nhận `repository_dispatch` kiểu `odoo-change`. Còn cần tài khoản Cloudflare và quyền quản trị Odoo để tạo Automation gọi Worker.

### Chất lượng code & tốc độ
- ✅ **Mở tức thì**: bản Excel gần nhất lưu trong IndexedDB, hiện ngay rồi cập nhật nền; chỉ tải lại khi file đổi (ETag/If-None-Match → GitHub trả 304, không tốn hạn mức). Khi đang xem bản lưu cũ thì chặn sửa/lưu để không ghi đè.
- ✅ **PWA**: `manifest.webmanifest`, `sw.js`, 2 icon → cài lên màn hình điện thoại (cần mở bằng https). Service worker chỉ lưu vỏ ứng dụng, không lưu dữ liệu GitHub.
- ✅ **Content-Security-Policy** (chỉ cho gọi `api.github.com`, chặn script/ảnh từ nơi khác).
- ✅ **Bảng PO dạng thẻ trên điện thoại** (mỗi PO một thẻ, dễ đọc hơn bảng ngang).
- ✅ **Test tự động** (`tests/`, dùng dữ liệu GIẢ): luồng trạng thái, bộ lọc nhiều điều kiện, thứ tự ưu tiên, PO Hoàn thành không trễ. Chạy tay: `python tests/test_app.py`.
- 🟡 **Chạy test trong GitHub Actions**: đã viết `.github/workflows/test.yml` cho repo po-dashboard (chạy khi sửa index.html), chưa chạy được thử ở đây.
- ❌ **Tách `index.html` thành nhiều file / minify**: bỏ qua có chủ đích, vì bạn đang cập nhật bằng cách thay đúng một file `index.html`; tách file sẽ bắt tải lên nhiều file và dễ sai. Không có công cụ minify trong môi trường này.
- 🟡 **Bảng dài**: cuộn tới cuối tự tải thêm 200 dòng (thay cho bấm "Hiện thêm"). Chưa ảo hóa thật, chưa cần với ~150 PO.
- 🟡 **Dọn trùng lặp mã** (rowsFor/collectItems…): chỉ dọn phần mới viết, chưa tái cấu trúc toàn bộ để tránh làm hỏng chức năng đang chạy.

## Đợt 3 – Kiểm tra mở file Excel khác tên PO-data (23/10/2026)
**Kết luận kiểm tra (đọc code `index.html`, `sync-odoo.yml`, chưa thử trên GitHub thật):**
- Mở file khác (nút chọn file / kéo thả): dashboard coi là nguồn "local". Sửa ô, thêm, xóa dòng chỉ **ghi vào chính file đó trên máy** (Chrome/Edge có quyền ghi) hoặc **tải về `<tên>_da-cap-nhat.xlsx`** (trình duyệt khác). **Không có đường nào tự đẩy lên GitHub** và không sửa `data/PO-data.xlsx`.
- Tự đồng bộ Odoo không bị ảnh hưởng: workflow chỉ chạy `data/PO-data.xlsx` và `git add -A data/`; với file local dashboard tắt hẳn việc theo dõi/kích hoạt đồng bộ Odoo.
- Dữ liệu phụ lưu **trong trình duyệt** (localStorage/IndexedDB), theo tên file: cột ẩn, độ rộng cột, chế độ xem, lịch sử thao tác.
- ✅ **Lỗi tìm thấy & đã sửa 1**: lịch sử thao tác của file khác bị bỏ vào hàng đợi chung `qlcv:histq`, lần sau mở PO-data từ GitHub sẽ bị đẩy vào `data/history.json` (lẫn tab/mã lạ). Giờ file local chỉ lưu lịch sử trong trình duyệt, không vào hàng đợi đẩy GitHub.
- ✅ **Lỗi tìm thấy & đã sửa 2**: hộp "Kết nối GitHub" cho đổi đường dẫn file tùy ý; nếu đặt `data/Khac.xlsx` thì `history.json` và `odoo-ids.json` dùng chung thư mục `data/` với PO-data. Giờ mọi đường dẫn khác `data/PO-data.xlsx` tự được đưa vào thư mục **`Dữ liệu Khác/`** ở gốc repo (nằm ngoài `data/` nên đồng bộ Odoo không đụng tới; history.json của file đó nằm riêng trong thư mục này).
- ✅ **Nút "☁ Đẩy lên GitHub"** (thanh trên cùng; chỉ hiện khi đã kết nối GitHub và đang mở file từ máy): đẩy file vào `Dữ liệu Khác/<tên file>`, luôn hỏi xác nhận (hỏi thêm nếu ghi đè), chỉ đẩy khi không còn thay đổi chưa lưu. Không đổi cấu hình GitHub. Cần token Contents: Read and write (thư mục tự tạo). 🟡 Mới kiểm tra cú pháp, chưa thử đẩy thật.
- ✅ **History riêng cho từng file**: PO-data giữ `data/history.json`; file khác trên GitHub dùng `Dữ liệu Khác/<tên>.history.json` và hàng đợi riêng trong trình duyệt; file mở từ máy chỉ lưu lịch sử trong trình duyệt. Với file khác PO-data, nút Đồng bộ Odoo và theo dõi đồng bộ Odoo bị tắt.
- ✅ **Lưu trữ riêng (không qua GitHub)**: (1) **Cloud riêng** = Google Drive của người dùng qua Apps Script tự cài (`cloud/apps-script.gs`, nút ☁ Cloud riêng, ☁ Đẩy lên cloud riêng; có khóa KEY, chặn ghi đè khi nơi khác vừa sửa); (2) **Trên máy**: nhớ file đã chọn, nút 📁 Mở lại file trên máy, tự ghi lại vào file (Chrome/Edge; để trong OneDrive/Drive desktop để đồng bộ nhiều máy). CSP đã mở thêm script.google.com và script.googleusercontent.com. File lưu dạng .xlsx trên Drive, KHÔNG phải Google Sheet đồng bộ từng ô. Cloud không có đồng bộ Odoo, lịch sử chỉ trong trình duyệt. 🟡 Mới kiểm tra cú pháp, chưa thử với Apps Script/Google thật (cần bạn thử theo HUONG_DAN.md); chưa xử lý xung đột kiểu gộp như GitHub, chỉ báo Tải lại.
- 🟡 Hai file local trùng tên với nhau (hoặc trùng `PO-data.xlsx`) sẽ dùng chung cột ẩn/độ rộng/lịch sử trong trình duyệt (chỉ ảnh hưởng cách xem). Chưa sửa.
- 🟡 Thao tác "tự thêm NCC vào DS NCC" và "tự tick TT trước" chạy với bất kỳ file nào có sheet cùng tên; chỉ thay đổi trong file đang mở rồi lưu về file đó.

**Cần bạn quyết định / kiểm tra**
1. Sau khi bạn thay `index.html` mới lên repo po-dashboard, hãy thử: mở 1 file khác, sửa 1 ô, xác nhận `data/PO-data.xlsx` và `data/history.json` trên GitHub không có commit mới.

## Đợt 4 – Tab "Theo dõi PAY" (thanh toán NCC) – ĐỀ XUẤT, chưa làm (23/10/2026)
Ký hiệu riêng cho đợt này: ⬜ chưa làm (đề xuất chờ bạn duyệt).

### 4.1 Hiện trạng đã đọc từ code (cơ sở cho đề xuất)
- Dashboard chỉ đọc **một file Excel** `data/PO-data.xlsx` trên GitHub; mỗi sheet là một tab. Dữ liệu Odoo chỉ vào Excel qua `scripts/sync_odoo.py` (workflow `sync-odoo.yml`, 15 phút/lần, giờ hành chính T2–T6). Hiện **chỉ đồng bộ `purchase.order`**, chưa đọc gì từ trang `…/odoo/vendor-payments`.
- Số PAY hiện chỉ có mặt dưới dạng **chữ gõ tay trong cột Note** của PO (vd. "PAY00598") – chưa có chỗ nào kiểm soát PAY đó đã thanh toán chưa. Luồng "Thanh toán trước" đã có hai bước `Chờ làm TT` → `Đã gửi UNC`.
- Đã có sẵn: hộp 🔔 "Nhắc việc – đơn trễ hẹn" (`lateMsgs/renderMsgs`), banner đầu trang, mở Odoo theo mã, lịch sử thao tác, tab tự sinh từ sheet. Chưa có mục nào tên "nhắc nhở kế toán thanh toán" → đề xuất tạo mới (mục 4.5).
- Script Tampermonkey `odoo-autofill-nhan-thanh-toan.user.js` đã chạy trên đúng trang `vendor-payments/…` nên biết các field tùy biến `x_beneficiary_*` của model thanh toán.

### 4.2 Hướng quản lý đề xuất: "PAY là một hồ sơ có vòng đời", khóa theo ID chứ không theo số PAY
Vì số PAY **đổi tên** thành chuỗi chứa `BNK` khi được thanh toán, **không dùng số PAY làm khóa** (sẽ mất dấu hồ sơ). Dùng **ID bản ghi Odoo** (`id` + công ty) làm khóa cố định, và lưu thêm:
| Cột trong sheet mới "Theo dõi PAY" | Nguồn / cách tính |
|---|---|
| ID Odoo, Công ty | `account.payment.id`, công ty |
| **Số PAY (ban đầu)** | tên lần đầu thấy dạng `PAY…` – **không ghi đè** khi đổi tên |
| **Số chứng từ hiện tại** | tên hiện tại trên Odoo (PAY… hoặc …BNK…) |
| NCC, Số tiền, Tiền tệ, Diễn giải (memo/ref) | từ Odoo |
| **Ngày lập PAY** | `create_date` (đổi sang giờ VN) |
| **Hạn thanh toán** | Ngày lập + 1 ngày (tham số `pay_overdue_days` trong `config.json`) |
| **Trạng thái TT** | xem 4.3 |
| Số BNK, Ngày thanh toán | tên chứa BNK; ngày lần đầu script thấy BNK (và `date` của phiếu) |
| PO liên quan | tìm mã `PO…` trong memo/ref, trong hóa đơn gắn với phiếu, và PO nào có Note chứa số PAY (dò ngược) |
| Số ngày chờ | hôm nay − ngày lập (chưa TT) hoặc ngày TT − ngày lập (đã TT) |
| **Nhắc KT thanh toán** | nội dung nhắc tự sinh (4.5), **tự xóa khi đã BNK** |
| Ngày nhắc, Số lần nhắc, Ghi chú | tay: bạn/kế toán ghi "đã nhắc chị X lúc…" |

### 4.3 Quy tắc phân loại (đúng như bạn mô tả, thêm vài trường hợp biên để không sót)
1. **Chưa thanh toán** = tên còn dạng `PAY…`, không chứa `BNK`, trạng thái Odoo chưa hủy.
2. **Đã thanh toán** = tên **chứa `BNK`** (quy tắc chính, theo bạn). Dùng thêm trạng thái Odoo (`state`, đã đối chiếu `is_reconciled`) chỉ để **cảnh báo bất thường** (vd. có BNK nhưng state là nháp/hủy; hoặc state đã trả nhưng tên vẫn PAY) – hiển thị nhãn "⚠ Kiểm tra", không tự đổi.
3. **Quá hạn** = Chưa thanh toán và (bây giờ − ngày lập) **> 1 ngày**. Tùy chọn (hỏi bạn ở 4.7): có bỏ qua T7/CN không (PAY lập chiều thứ Sáu thì thứ Hai mới coi là quá hạn).
4. **Đã hủy** = state hủy hoặc phiếu bị xóa trên Odoo → chuyển nhãn "Đã hủy", **không xóa dòng**, không nhắc nữa (khác PO: giữ lịch sử để đối chiếu; PAY mất mà chưa BNK phải được thấy).
5. **PAY biến mất khỏi Odoo nhưng chưa BNK** → nhãn "⚠ Không còn trên Odoo", không nhắc.
6. Thanh toán **một phần / gộp nhiều PO / nhiều PAY cho một PO**: tab hiển thị theo từng PAY; ở cấp PO gộp lại: "đã TT x/y PAY".

### 4.4 Cách lấy dữ liệu (kiến trúc: tái dùng hạ tầng sẵn có, không thêm dịch vụ)
- ⬜ **Bước 0 – thăm dò (làm đầu tiên, 15 phút):** chạy thử với tài khoản API hiện tại xem đọc được model **`account.payment`** không (điều kiện: `payment_type = outbound`, `partner_type = supplier`; trang `vendor-payments` của Odoo 17 chính là model này). Lấy `fields_get` để xác nhận tên field thật (`name`, `partner_id`, `amount`, `currency_id`, `state`, `create_date`, `date`, `memo`/`ref`, `move_id`, `is_reconciled`, các field `x_beneficiary_*`). Kết quả quyết định đi đường A hay B.
- ⬜ **Đường A (ưu tiên) – mở rộng đồng bộ Odoo hiện có:** thêm `scripts/sync_pay.py` (dùng chung lớp `Odoo` trong `sync_odoo.py`, cùng secrets, cùng workflow 15 phút, cùng cơ chế `git add -A data/` + thử lại khi xung đột). Khóa = ID Odoo; **thêm dòng mới, cập nhật dòng cũ, không xóa**; giữ nguyên các cột tay (Ghi chú, Số lần nhắc). Cấu hình trong mục `pay_sync` của `config.json` (tên model, domain, công ty, `pay_overdue_days`, mẫu nhận diện `PAY`/`BNK`). Lỗi ở bước PAY **không được làm hỏng** đồng bộ PO (giống cách `ncc_sync` đang làm).
- ⬜ **Đường B (dự phòng nếu tài khoản API không đọc được `account.payment`):** mở rộng userscript Tampermonkey: khi bạn mở danh sách `vendor-payments`, script đọc các dòng đang hiển thị (số chứng từ, NCC, số tiền, ngày) rồi đẩy lên GitHub (cần token) hoặc xuất file JSON để dashboard nạp. Kém tự động hơn (chỉ chạy khi bạn mở Odoo) nên chỉ dùng khi buộc phải.
- ⬜ **Đồng bộ ngược khi bạn tạo PAY:** nút "＋ Đã lập PAY" ở PO (hoặc tự dò memo chứa mã PO) để gắn PO↔PAY ngay cả khi memo không ghi mã PO; nếu PO đang ở `Chờ làm TT` thì **gợi ý** chuyển `Đã gửi UNC` (chỉ gợi ý, không tự đổi – giống nút 💡 Hoàn thành).
- ⬜ Mỗi lần chạy ghi log: số PAY mới, số vừa chuyển BNK, số quá hạn, các PAY bất thường – xem được trong Actions như log PO hiện nay.

### 4.5 Giao diện dashboard
- ⬜ **Tab mới "Theo dõi PAY"** (sheet cùng tên trong `PO-data.xlsx`, tận dụng cơ chế tab theo sheet + bộ lọc kiểu Excel + ẩn/hiện cột + xuất Excel đã có; thêm hiển thị riêng):
  - Thanh tóm tắt trên cùng: **Chưa TT (n, tổng tiền) · Quá hạn (n, tổng tiền) · Đã TT hôm nay · Đã TT 7 ngày**; bấm vào để lọc.
  - Nhãn màu theo trạng thái: 🟢 Đã TT (BNK) · 🟡 Chưa TT trong hạn · 🔴 Quá hạn N ngày · ⚪ Đã hủy · ⚠ Bất thường. Mặc định sắp xếp: quá hạn lâu nhất lên đầu.
  - Bấm số PAY/BNK → mở đúng phiếu trên Odoo (giống `odoo-ids.json` đang dùng cho PO: thêm `pay-ids.json`).
  - Cột "PO liên quan" bấm để nhảy sang tab PO đã lọc đúng PO đó.
- ⬜ **Mục "Nhắc kế toán thanh toán"** (tạo mới, theo yêu cầu "quá hạn 1 ngày từ khi lập PAY thì note báo lại"):
  1. Script đồng bộ tự điền cột **"Nhắc KT thanh toán"** của dòng PAY quá hạn, nội dung ví dụ: `Quá hạn 2 ngày: PAY00598 – NCC X – 12.500.000đ (lập 21/10) – chưa có BNK, nhờ KT thanh toán`. Chỉ ghi khi chưa có nội dung (không đè ghi chú tay), và **tự xóa/đổi thành "Đã TT <số BNK> ngày …"** khi PAY chuyển BNK.
  2. Trong hộp 🔔 hiện nhóm riêng "Nhắc kế toán thanh toán" (tách khỏi "đơn trễ hẹn"), có nút: 🔍 Mở trên Odoo · ✅ Đã nhắc (ghi ngày + tăng số lần nhắc) · 📋 Sao chép nội dung nhắc (dán vào Zalo/email gửi kế toán) · 🎤 Ghi chú. Banner đầu trang thêm "n PAY quá hạn thanh toán".
  3. Ở tab **PO**: thêm huy hiệu cạnh Note: `PAY00598 · chờ TT 2 ngày` (đỏ khi quá hạn) hoặc `BNK… ✔` (xanh), để thấy ngay đơn nào đã/chưa thanh toán mà không phải mở tab PAY.
  4. Khóa chống nhắc lặp: mỗi PAY mỗi ngày chỉ hiện một tin; bấm "Đã nhắc" thì ẩn đến hết ngày, sang ngày sau nếu vẫn chưa BNK thì hiện lại với "quá hạn N+1 ngày".
- ⬜ Gửi nhắc tự động ra ngoài (Zalo/email cho kế toán) **vẫn chưa làm** vì cùng lý do mục Zalo/email ở Đợt 2; trước mắt dùng nút "Sao chép nội dung nhắc".

### 4.6 Các bước triển khai (thứ tự đề xuất, mỗi bước kiểm chứng được độc lập)
1. ⬜ Bước 0: thăm dò quyền đọc `account.payment` + tên field (xem 4.4). **Cần bạn cung cấp:** một vài số PAY chưa TT và vài số BNK đã TT thật (để đối chiếu quy tắc nhận diện, và xem memo có ghi mã PO không).
2. ⬜ Viết `scripts/sync_pay.py` + mục `pay_sync` trong `config.json` + sheet "Theo dõi PAY" (tự tạo cột); thêm vào `sync-odoo.yml`; chạy `--probe` kiểm tra không ghi file.
3. ⬜ Test tự động với dữ liệu giả (đúng thói quen thư mục `tests/`): PAY mới → chưa TT; đổi tên sang BNK → Đã TT & giữ khóa/Số PAY ban đầu; quá 1 ngày → có nhắc; có BNK → xóa nhắc; PAY biến mất → "Không còn trên Odoo"; lỗi API không làm hỏng sync PO.
4. ⬜ Dashboard: tab "Theo dõi PAY" + thanh tóm tắt + nhãn màu + lọc (không động tới logic các tab cũ).
5. ⬜ Dashboard: nhóm "Nhắc kế toán thanh toán" trong 🔔 + banner + huy hiệu PAY ở tab PO + nút "Đã nhắc/Sao chép".
6. ⬜ Gắn PAY↔PO (memo/hóa đơn/Note) và gợi ý đổi bước `Chờ làm TT` → `Đã gửi UNC` → các bước sau.
7. ⬜ Cập nhật `HUONG_DAN.md`; chạy thử trên dữ liệu thật 2–3 ngày rồi chỉnh quy tắc.

### 4.7 Đã chốt (23/10/2026, theo trả lời của bạn)
1. ✅ **Quá hạn tính theo ngày làm việc T2–T6, T7/CN không tính**: hạn thanh toán = ngày lập PAY (lập T7/CN thì hạn là thứ Hai kế tiếp); khi đã qua ≥ 1 ngày làm việc kể từ hạn mà PAY chưa thanh toán thì quá hạn và bị nhắc (vd. lập T2 → nhắc từ T3; lập T6 → nhắc từ T2). Ngưỡng đổi ở `pay_sync.overdue_days` trong config.json.
2. ✅ **Nhắc kế toán bằng tin nhắn trong Chatter của Odoo**, gắn vào chính phiếu PAY (hoặc PO): ô "Gửi tin" (nút `o-mail-Chatter-sendMessage`), bỏ chế độ email (chọn Ghi chú/Gửi tin nội bộ), @tag tên kế toán. Dashboard soạn sẵn nội dung + nút mở đúng phiếu; ⬜ việc tự động đăng tin cần ghi vào Odoo (mail.message) nên phải kiểm tra quyền ghi của tài khoản API – nếu chưa có thì dùng nút "Sao chép nội dung" dán vào Chatter.
3. ✅ **Quản lý theo số PAY** (một PAY gộp nhiều PO). Cột "PO liên quan" liệt kê tất cả PO trong phiếu.
4. ✅ **Tự động đổi bước PO** khi PAY thành BNK (PO đang `Chờ làm TT` / bước trả trước trước `Đã gửi UNC` -> chuyển sang bước kế tiếp theo quy trình); mọi lần đổi ghi vào lịch sử thao tác.
5. ✅ **Lấy PAY của cả 2 công ty** từ `erp.dekko.com.vn/odoo/vendor-payments` (tiền tố số BNK: **DQ/** = Nhựa Dung Quất, **PH/** = Phúc Hà).
6. ✅ **Nhận diện trạng thái theo cột "Trạng thái" trên Odoo**: **Nháp** = chưa thanh toán (số PAY…, vd PAY01086, PAY02087); đã thanh toán thì số đổi thành BNK (vd DQ/BNK526092400061, PH/BNK526101900466).
7. ✅ **Bấm đúp một dòng ở tab Phiếu thanh toán → mở phiếu đó trên Odoo.**
8. ⬜ Cách lấy dữ liệu: crawl trang vendor-payments bằng phiên đăng nhập của bạn (bước 0) để xác nhận field thật; sau đó script đồng bộ đọc qua API.

### 4.9 Kết quả khảo sát Odoo thật (23/10/2026, qua Chrome đã đăng nhập, chỉ ĐỌC) và tình trạng làm
**Khảo sát (model `account.payment`, payment_type=outbound, partner_type=supplier, tổng 1.503 phiếu của 27 người lập, 6 công ty):**
- Trạng thái Odoo có 4 giá trị đang dùng: **draft (Nháp) 123 · approved (Đã duyệt) 134 · paid 1.231 · canceled 15**. ⚠ Phiếu **Đã duyệt vẫn mang số PAY** (vd. PAY03285, PAY02939) nên **"chưa thanh toán" = Nháp + Đã duyệt**, không chỉ Nháp như bạn nêu; đã thanh toán = `paid` (số `PH/BNK…` hoặc `DQ/BNK…`). Đã đưa cả hai vào quy tắc.
- Mẫu số của chính bạn (create_uid = tài khoản đăng nhập, 2 công ty Phúc Hà + Dung Quất): 73 phiếu – PAY nháp 11, PAY đã duyệt 9, BNK đã thanh toán 50, hủy 1, và **2 phiếu số `DQ/BNK…` nhưng trạng thái vẫn Nháp** (bất thường → dashboard/script ghi nhãn "⚠ Kiểm tra" và KHÔNG nhắc; cần bạn xem 2 phiếu này).
- Memo (diễn giải) có mã PO ở 35/73 phiếu (vd. "Cty Phúc Hà tt POKR&D00019") → dùng để gắn PAY↔PO; phiếu memo kiểu "TT hóa đơn 1564" không có mã PO nên gắn thêm bằng Note của PO có ghi số PAY. Phiếu đang mở chưa có hóa đơn đối chiếu (`reconciled_bill_ids` trống) nên không dùng được.
- Ngày lập lấy `create_date` (đổi sang giờ VN). Phạm vi mặc định: **chỉ phiếu do chính bạn lập** (`create_uid = {uid}`) của 2 công ty trong config.json; muốn lấy phiếu của cả đồng nghiệp thì bỏ điều kiện `create_uid` trong `pay_sync.domain` (sẽ thành ~1.300 phiếu).
- Tôi không dùng khóa API bạn gửi trong chat; việc đọc đã làm bằng phiên Chrome. Khóa đã nằm trong chat nên nếu lo ngại hãy tạo lại khóa mới trên Odoo (Tài khoản → Bảo mật → Khóa API).

**Đã viết (🟡 chưa chạy thử trên GitHub/Odoo thật vì máy này không có Python):**
- ✅ `po-data/scripts/pay_sync.py` + mục `pay_sync` trong `config.json` + móc vào `sync_odoo.py` (chạy cùng workflow 15 phút; lỗi PAY không làm hỏng sync PO). Tạo/ghi sheet **"Phiếu thanh toán"** (khóa theo ID Odoo, giữ cột "Ghi chú" và mọi cột lạ bạn thêm), tính trạng thái, hạn, số ngày làm việc trễ, PO liên quan, cột "Nhắc KT thanh toán"; PAY thành BNK thì PO trả trước (Thanh toán trước = Có) đang ở bước trước "Đã gửi UNC" **tự chuyển "Đã gửi UNC"**, mỗi PAY một lần (nhớ trong `data/pay-state.json`).
- ✅ Dashboard (`index.html`): tab "Phiếu thanh toán" tự hiện khi sheet có trong Excel; **bấm đúp vào dòng → mở phiếu trên Odoo** (riêng cột Ghi chú vẫn sửa được); quá hạn tính theo ngày làm việc (đã thử hàm tính ngày: lập T6 → T2 trễ 1, T3 trễ 2…); PAY quá hạn vào hộp 🔔, banner và tab Ưu tiên, kèm nút "Mở phiếu trên Odoo" và "Sao chép nhắc KT". Đã kiểm tra cú pháp `index.html`; chưa mở thử với file Excel có sheet này.
- ⬜ Chưa làm: tự đăng tin vào Chatter Odoo và tag kế toán (cần quyền ghi `mail.message`; hiện dùng nút sao chép rồi dán vào ô Gửi tin, bỏ chế độ email); ô `pay_sync.accountant_tag` trong config.json dành sẵn để chèn tên kế toán vào đầu nội dung nhắc (bạn cho tên cần tag).
- ✅ (23/10/2026) **Huy hiệu PAY/BNK ở tab PO** (cạnh trạng thái Note): `PAY… · chờ TT` (vàng), `PAY… · quá hạn N ngày` (đỏ), `DQ/BNK… ✔` (xanh), hủy/không còn trên Odoo (xám). Gắn theo cột "PO liên quan" của tab Phiếu thanh toán và theo số PAY ghi trong Note/Ghi chú của PO. 🟡 Mới kiểm tra cú pháp `index.html`, chưa mở thử với file Excel thật.
- ✅ (23/10/2026) **Test tự động cho `pay_sync`**: `po-data/tests/test_pay_sync.py`, 17 test dữ liệu giả (phân loại, ngày làm việc/T7-CN, nhắc quá hạn, giữ Số PAY khi đổi BNK, hủy/biến mất, giữ cột tay, gắn PAY↔PO, tự chuyển PO sang Đã gửi UNC đúng một lần, chạy `run` với Odoo giả), tất cả đạt. Chạy: `python tests/test_pay_sync.py` (cần openpyxl; trên Windows thêm `pip install tzdata`). Test phát hiện và đã sửa 1 lỗi: số tiền nguyên (1000000.0 vs 1000000 sau khi đọc lại Excel) khiến cờ `changed` luôn True → mỗi lần chạy đều ghi/commit thừa.
- ✅ (23/10/2026) Đã viết mục "Phiếu thanh toán NCC" trong HUONG_DAN.md.
- ✅ (23/10/2026) **Nhắc duyệt PAY tự @tag trong Chatter** làm bằng Tampermonkey (không dùng quyền ghi `mail.message`): nút 💬 trong `odoo-autofill-nhan-thanh-toan.user.js` v1.1.0 gõ vào ô `o-mail-Composer-input`: Phúc Hà → @HN0025 Lê Xuân Giang "Anh ơi kiểm tra duyệt giúp em PAY này ạ"; Dung Quất → @HN0096 Nguyễn Thị Mai "Chị ơi xem giúp em PAY này ạ". Mặc định gõ sẵn, người dùng bấm Gửi (có tùy chọn tự gửi). 🟡 Mới kiểm tra cú pháp, chưa thử trên Odoo thật; chưa gọi từ dashboard (phải mở phiếu trên Odoo rồi bấm nút).
- ✅ (24/10/2026) Làm rõ: nhắc duyệt chỉ cho phiếu nhãn "⚠ Kiểm tra". Script đồng bộ điền "Nhắc KT thanh toán" cho phiếu Kiểm tra (tag người duyệt theo công ty, `pay_sync.check_approvers`); dashboard đưa các phiếu này vào hộp 🔔 (nút mở phiếu + sao chép); nút 💬 hỏi lại nếu phiếu chưa có số BNK. 18 test pay_sync đạt. Chưa thử trên Odoo thật.
- ✅ (24/10/2026) **Bước "KTNH xác nhận"** (một bước riêng trong thanh trạng thái Odoo: Nháp → Chờ phê duyệt → KTT duyệt → Chờ thanh toán → KTNH xác nhận → Đã thanh toán): nút 💬 tự tag @[HN10265] Phạm Thị Mai Lê "Em ơi xem thanh toán cho anh PAY này" khi bước đang sáng là KTNH; script đồng bộ điền sẵn cột Nhắc KT và thêm cột "Trạng thái Odoo" (nhãn lấy bằng fields_get). 🟡 Chưa thử Odoo thật; dashboard chưa lọc theo cột mới.
- 🟡 Cách chạy kiểm thử đầu tiên: Actions → "Đồng bộ đơn mua từ Odoo" → **Run workflow với "Chạy thử" (probe)** xem log dòng "PAY: …", rồi chạy thật.

### 4.8 Rủi ro / giới hạn cần biết trước
- 🟡 Chưa xác minh được tài khoản API hiện tại có quyền đọc thanh toán nhà cung cấp; nếu không, đi đường B hoặc nhờ quản trị Odoo cấp quyền đọc `account.payment` (chỉ đọc).
- 🟡 Quy tắc "tên chứa BNK" phụ thuộc cách đặt tên của Dekko; cần đối chiếu với dữ liệu thật ở bước 0 (vd. nếu có nhiều sổ nhật ký ngân hàng, hay phiếu tiền mặt `CSH…` thì cũng là đã thanh toán nhưng không có BNK → thêm mẫu vào `config.json`).
- 🟡 Dữ liệu PAY vào chung `PO-data.xlsx`; mỗi lần đồng bộ sẽ thêm commit như PO. Nếu file lớn dần, cân nhắc chuyển PAY đã TT quá 90 ngày sang sheet lưu trữ.
- ⚠ Dashboard chưa có sẵn chỗ "nhắc kế toán" nào để nối vào – đây là chức năng mới hoàn toàn (4.5), không phải chỉnh sửa nhỏ.

## Đã bỏ theo yêu cầu
- Bot nhắc việc (Telegram/Zalo/email) và tuổi công nợ theo nhà cung cấp.

## Chốt cấu hình
- Đồng bộ Odoo: 15 phút/lần trong giờ làm việc (không dùng 18 vì cron không chia đều được giờ), thêm đồng bộ khi mở dashboard nếu dữ liệu cũ hơn 10 phút.
- Odoo tức thời: bỏ qua vì tài khoản không phải quản trị (is_system: false). Có thể nhờ quản trị viên Odoo tạo Automation sau này.

## Cần bạn kiểm tra
1. Nhãn trạng thái "Dự thảo" và "Đã phê duyệt" của Odoo có đúng không (file của bạn chưa có cột này): xem log lần "Chạy thử" của workflow.
2. Mở Odoo bằng liên kết trực tiếp đã đúng công ty chưa (tham số `?cids=`).
3. Note cũ dạng ghi chú tự do (vd. "PAY00598") nên chuyển sang cột "Ghi chú".
