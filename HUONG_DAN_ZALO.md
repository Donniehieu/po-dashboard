# Hướng dẫn: nhắn Zalo cho Thủ kho từ phiếu kho trên Odoo (bán tự động)

Từ màn hình **phiếu kho** trên Odoo, bấm một nút để mở Zalo Web của Thủ kho và **tự điền sẵn tin nhắn** vào ô chat:

> Chị ơi, kiểm đếm và nhập giúp em phiếu kho này **KDQ/IN/00398**

Hệ thống **không tự gửi**: bạn kiểm tra đúng người nhận rồi bấm **Enter**. (Tự gửi hàng loạt bằng tài khoản cá nhân có nguy cơ bị Zalo khóa, nên cố ý để bước cuối do bạn bấm.)

## Chuẩn bị (làm một lần)

### Bước 1. Cập nhật script Tampermonkey (bắt buộc, vì phải thêm quyền cho Zalo Web)
Bạn đã có script "Odoo Helper" trong Tampermonkey. Cần thay bằng bản mới 2.1.0:

1. Trên trình duyệt (Chrome/Edge), bấm biểu tượng **Tampermonkey** → **Bảng điều khiển (Dashboard)**.
2. Trong danh sách, bấm vào tên script **Odoo Helper …** để mở trình soạn thảo.
3. Bấm vào vùng mã, nhấn **Ctrl+A** (chọn hết) rồi **Delete** để xóa mã cũ.
4. Mở file `D:\PO\Quan_ly_cv\po-data\odoo-autofill-nhan-thanh-toan.user.js` bằng Notepad, nhấn **Ctrl+A**, **Ctrl+C**.
5. Quay lại Tampermonkey, nhấn **Ctrl+V** để dán, rồi nhấn **Ctrl+S** (hoặc menu *Tệp → Lưu*).
6. Kiểm tra dòng đầu của mã có `@version 2.1.0` và có các dòng `@match` cho `erp.dekko.com.vn`, `chat.zalo.me`, `zalo.me`.
7. Trong Dashboard của Tampermonkey, công tắc của script phải ở trạng thái **Bật**.

Nếu Chrome báo script không chạy: vào `chrome://extensions` → Tampermonkey → bật **Cho phép script người dùng (Allow user scripts)** (hoặc bật *Chế độ cho nhà phát triển* ở góc phải trên, tùy phiên bản Chrome).

> Chỉ lần này cần cập nhật tay. Phần chạy trên Odoo vẫn tự lấy bản mới từ dashboard như trước.

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

## Cách dùng hằng ngày
1. Mở phiếu kho trên Odoo.
2. Bấm **💬 Nhắn Zalo thủ kho**.
3. Một tab Zalo mở ra (tin cũng đã được sao chép sẵn vào bộ nhớ tạm).
4. Nếu Zalo hiện trang giới thiệu tài khoản, bấm **Nhắn tin** / **Dùng Zalo Web** để vào cuộc trò chuyện. Nếu Zalo hỏi mở ứng dụng, chọn tiếp tục trên trình duyệt.
5. Khi ô chat hiện ra, tin **tự điền** và có khung nhỏ ở góc trái dưới: *"Đã điền tin vào ô chat…"*.
6. Kiểm tra đúng người nhận, bấm **Enter** để gửi.

## Nếu có sự cố
| Hiện tượng | Cách xử lý |
|---|---|
| Không thấy nút 💬 Nhắn Zalo thủ kho | Chỉ hiện ở màn hình phiếu kho (số phiếu dạng `KDQ/IN/00398`). Tải lại trang bằng Ctrl+F5. Khung Helper phải hiện ở góc phải dưới. |
| Bấm nút mà hiện hộp cài đặt | Chưa có Thủ kho cho đầu số của phiếu này. Nhập ở hộp rồi Lưu, bấm lại nút. |
| Tab Zalo mở nhưng không tự điền, khung góc trái ghi "đang chờ" | Chưa mở cuộc trò chuyện với Thủ kho. Mở cuộc trò chuyện, tin sẽ tự điền (chờ tối đa 10 phút). |
| Khung đỏ "Không điền tự động được" | Tin đã nằm trong bộ nhớ tạm: bấm vào ô chat rồi **Ctrl+V**. |
| Không có khung nhỏ nào ở trang Zalo | Script chưa chạy trên Zalo: kiểm tra Bước 1 (đã lưu bản 2.1.0, có `@match` của `chat.zalo.me`, công tắc bật). Trên trang Zalo, biểu tượng Tampermonkey phải có số **1**. |
| Zalo mở sai người / báo không tìm thấy | Số điện thoại chưa đăng ký Zalo hoặc người đó chặn tìm theo số. Dùng liên kết `zalo.me` của họ thay cho số. |
| Mỗi lần bấm lại mở thêm tab | Bình thường nếu tab Zalo cũ đã đóng; nếu còn mở, tab cũ được dùng lại. |

## Bảo mật
- Tin chỉ được nhận từ tab Odoo (`https://erp.dekko.com.vn`); nguồn khác bị bỏ qua.
- Script **không tự bấm gửi** và không đọc nội dung các cuộc trò chuyện Zalo.
- Số điện thoại Thủ kho lưu trong trình duyệt của bạn (localStorage của trang Odoo).

## Lưu ý đã kiểm tra
Đã thử trọn luồng bằng trang Odoo và trang Zalo giả có cấu trúc tương tự: tin sang đúng tab, tự điền vào ô chat, không tự gửi, bỏ qua tin từ nguồn lạ. **Chưa thử trên Zalo Web thật** (cần đăng nhập Zalo của bạn). Nếu ô chat của Zalo Web đổi cấu trúc khiến không tự điền được, tin vẫn nằm sẵn trong bộ nhớ tạm để dán (Ctrl+V); khi đó hãy báo để mình chỉnh lại cách tìm ô chat.
