# Hướng dẫn: nhắn Zalo cho Thủ kho từ phiếu kho trên Odoo (bán tự động)

Từ màn hình **phiếu kho** trên Odoo, bấm một nút để mở Zalo Web của Thủ kho và **tự điền sẵn tin nhắn** vào ô chat:

> Chị ơi, kiểm đếm và nhập giúp em phiếu kho này **KDQ/IN/00398**

Hệ thống **không tự gửi**: bạn kiểm tra đúng người nhận rồi bấm **Enter**. (Tự gửi hàng loạt bằng tài khoản cá nhân có nguy cơ bị Zalo khóa, nên cố ý để bước cuối do bạn bấm.)

## Chuẩn bị (làm một lần)

### Bước 1. Cài script Tampermonkey bản 2.1.1 (làm một lần, từ lần sau tự cập nhật)
Cách nhanh nhất, bằng liên kết cài đặt:

1. Mở liên kết này trên trình duyệt đang dùng cho Odoo: **https://donniehieu.github.io/po-dashboard/odoo-helper.user.js**
2. Tampermonkey hiện trang cài đặt → bấm **Cài đặt** (hoặc **Cập nhật / Cài đặt lại** nếu đã có).
3. Vào Tampermonkey → **Bảng điều khiển** (Dashboard): nếu còn **hai** script Odoo Helper (bản cũ tên "Odoo Helper (mồi tải bản mới nhất từ dashboard)" và bản mới "Odoo Helper + Zalo …") thì **xóa hoặc tắt bản cũ**, chỉ để bản mới bật.
4. Kiểm tra bản mới có `@version 2.1.1`, có `@match` cho `erp.dekko.com.vn`, `chat.zalo.me`, `zalo.me`, và công tắc đang **Bật**.

Bản này có `@updateURL`: Tampermonkey tự kiểm tra và cập nhật chính script (mặc định mỗi ngày; muốn ngay thì bấm *Tìm bản cập nhật* ở Dashboard). Phần chạy trên Odoo tự lấy mã mới từ dashboard mỗi **5 phút**.

Cách dự phòng nếu liên kết không mở trang cài đặt: Tampermonkey → Dashboard → mở script → xóa mã cũ → dán toàn bộ nội dung file `D:POQuan_ly_cvpo-dataodoo-autofill-nhan-thanh-toan.user.js` → **Ctrl+S**.

Nếu Chrome báo script không chạy: vào `chrome://extensions` → Tampermonkey → bật **Cho phép script người dùng (Allow user scripts)** (hoặc bật *Chế độ cho nhà phát triển* ở góc phải trên, tùy phiên bản Chrome).

### Bước 2. Đăng nhập Zalo Web trên cùng trình duyệt
1. Mở https://chat.zalo.me/ rồi đăng nhập bằng **mã QR** (quét bằng Zalo trên điện thoại của bạn).
2. Chọn **ghi nhớ đăng nhập** nếu Zalo hỏi, để không phải quét lại mỗi lần.
3. Giữ trình duyệt này làm trình duyệt dùng cho Odoo.

### Bước 3. Cho phép cửa sổ bật lên (pop-up) của Odoo
Lần đầu bấm nút, trình duyệt có thể chặn cửa sổ Zalo. Bấm vào biểu tượng chặn pop-up ở thanh địa chỉ → **Luôn cho phép pop-up từ erp.dekko.com.vn**.

### Bước 4. Nhập danh sách Thủ kho (một lần)
1. Mở một **phiếu kho** trên Odoo (ví dụ `…/action-322/27772`; số phiếu dạng `KDQ/IN/00398`).
2. Trong khung **Odoo Helper** (góc phải dưới), bấm nút **⚙** cạnh nút **💬 Nhắn Zalo thủ kho**.
3. Nhập từng Thủ kho, mỗi dòng gồm:
   - **Đầu số**: phần đầu của số phiếu, ví dụ `KDQ` (Dung Quất) hoặc `KPH` (Phúc Hà). Để trống hoặc ghi `*` nếu một người nhận mọi phiếu.
   - **Tên**: để bạn dễ nhìn.
   - **SĐT Zalo hoặc liên kết**: số điện thoại người đó đã đăng ký Zalo (ví dụ `0912345678`) hoặc liên kết dạng `https://zalo.me/…` (dùng cho nhóm).
4. Sửa **Mẫu tin nhắn** nếu muốn (`{phieu}` sẽ được thay bằng số phiếu kho).
5. Bấm **Lưu**. Dữ liệu chỉ lưu trong trình duyệt của bạn, không gửi đi đâu.

### Thủ kho không có số điện thoại, chỉ có chat cũ trong Zalo
Trong hộp ⚙, chỉ ghi **Tên** (và đầu số kho), **để trống ô SĐT/liên kết**. Khi bấm **💬 Nhắn Zalo thủ kho**:
1. Zalo Web mở ra (tin đã sao chép sẵn).
2. Trong Zalo, bấm vào **chat cũ** với người đó.
3. Ở khung nhỏ góc trái dưới trang Zalo, bấm **✍ Điền vào cuộc trò chuyện đang mở**. Tin được điền vào ô chat.
4. Kiểm tra đúng người rồi bấm **Enter**.
Cách này không tự điền để tránh điền nhầm vào cuộc trò chuyện khác đang mở. Muốn tự điền hoàn toàn thì cần số điện thoại hoặc liên kết `zalo.me` của người đó.

## Cách dùng hằng ngày
(Từ khi script mồi lên 2.1.3, Thủ kho ghi bằng **số điện thoại** sẽ mở **Zalo Web**, vì trang `zalo.me/<số>` của Zalo chỉ có nút "Nhắn tin" mở ứng dụng trên máy, không vào được Zalo Web.)

1. Mở phiếu kho trên Odoo.
2. Bấm **💬 Nhắn Zalo thủ kho**. Tab Zalo Web mở ra (tin cũng đã được sao chép sẵn).
3. Ở khung nhỏ góc trái dưới trang Zalo: bấm **🔎 Điền SĐT vào ô tìm kiếm** để đưa số của Thủ kho vào ô **Tìm kiếm** của Zalo, rồi bấm vào kết quả để mở cuộc trò chuyện. (Có chat cũ rồi thì bấm thẳng vào chat cũ.)
4. Khi cuộc trò chuyện đã mở, bấm **✍ Điền vào cuộc trò chuyện đang mở**. Tin được điền vào ô chat.
5. Kiểm tra đúng người nhận rồi bấm **Enter** để gửi.

Nếu Thủ kho được ghi bằng **liên kết** `https://zalo.me/g/…` (nhóm) thì mở đúng liên kết đó và tin tự điền khi ô chat xuất hiện, không cần bấm nút Điền.

## Nếu có sự cố
| Hiện tượng | Cách xử lý |
|---|---|
| Không thấy nút 💬 Nhắn Zalo thủ kho | Chỉ hiện ở màn hình phiếu kho (số phiếu dạng `KDQ/IN/00398`). Tải lại trang bằng Ctrl+F5. Khung Helper phải hiện ở góc phải dưới. |
| Bấm nút mà hiện hộp cài đặt | Chưa có Thủ kho cho đầu số của phiếu này. Nhập ở hộp rồi Lưu, bấm lại nút. |
| Tab Zalo mở nhưng không tự điền, khung góc trái ghi "đang chờ" | Chưa mở cuộc trò chuyện với Thủ kho. Mở cuộc trò chuyện, tin sẽ tự điền (chờ tối đa 10 phút). |
| Khung đỏ "Không điền tự động được" | Tin đã nằm trong bộ nhớ tạm: bấm vào ô chat rồi **Ctrl+V**. |
| Không có khung nhỏ nào ở trang Zalo | Script chưa chạy trên Zalo: kiểm tra Bước 1 (đã cài bản 2.1.1, có `@match` của `chat.zalo.me`, công tắc bật). Trên trang Zalo, biểu tượng Tampermonkey phải có số **1**. |
| Zalo mở sai người / báo không tìm thấy | Số điện thoại chưa đăng ký Zalo hoặc người đó chặn tìm theo số. Dùng liên kết `zalo.me` của họ thay cho số. |
| Mỗi lần bấm lại mở thêm tab | Bình thường nếu tab Zalo cũ đã đóng; nếu còn mở, tab cũ được dùng lại. |

## Bảo mật
- Tin chỉ được nhận từ tab Odoo (`https://erp.dekko.com.vn`); nguồn khác bị bỏ qua.
- Script **không tự bấm gửi** và không đọc nội dung các cuộc trò chuyện Zalo.
- Số điện thoại Thủ kho lưu trong trình duyệt của bạn (localStorage của trang Odoo).

## Lưu ý đã kiểm tra
Đã thử trọn luồng bằng trang Odoo và trang Zalo giả có cấu trúc tương tự: tin sang đúng tab, tự điền vào ô chat, không tự gửi, bỏ qua tin từ nguồn lạ. **Chưa thử trên Zalo Web thật** (cần đăng nhập Zalo của bạn). Nếu ô chat của Zalo Web đổi cấu trúc khiến không tự điền được, tin vẫn nằm sẵn trong bộ nhớ tạm để dán (Ctrl+V); khi đó hãy báo để mình chỉnh lại cách tìm ô chat.
