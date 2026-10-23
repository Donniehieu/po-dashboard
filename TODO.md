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

## Đã bỏ theo yêu cầu
- Bot nhắc việc (Telegram/Zalo/email) và tuổi công nợ theo nhà cung cấp.

## Chốt cấu hình
- Đồng bộ Odoo: 15 phút/lần trong giờ làm việc (không dùng 18 vì cron không chia đều được giờ), thêm đồng bộ khi mở dashboard nếu dữ liệu cũ hơn 10 phút.
- Odoo tức thời: bỏ qua vì tài khoản không phải quản trị (is_system: false). Có thể nhờ quản trị viên Odoo tạo Automation sau này.

## Cần bạn kiểm tra
1. Nhãn trạng thái "Dự thảo" và "Đã phê duyệt" của Odoo có đúng không (file của bạn chưa có cột này): xem log lần "Chạy thử" của workflow.
2. Mở Odoo bằng liên kết trực tiếp đã đúng công ty chưa (tham số `?cids=`).
3. Note cũ dạng ghi chú tự do (vd. "PAY00598") nên chuyển sang cột "Ghi chú".
