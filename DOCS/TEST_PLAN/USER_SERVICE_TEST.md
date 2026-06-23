# Hướng Dẫn Kiểm Thử: User Service (Người Dùng & Hồ Sơ)

File này chứa các kịch bản kiểm thử chi tiết cho **User Service**, bao gồm các tính năng về Xác thực, Hồ sơ cá nhân và Nhắn tin.

## 1. Đăng ký & Đăng nhập (Authentication)
*   **Chức năng:** Cho phép người dùng tạo tài khoản, xác thực OTP và đăng nhập.
*   **Các bước thực hiện:**
    1.  Truy cập trang Đăng ký.
    2.  Nhập email, mật khẩu và chọn vai trò (Sinh viên hoặc Nhà tuyển dụng).
    3.  Nhận mã OTP qua email (kiểm tra Console của backend hoặc Email thật).
    4.  Nhập OTP để kích hoạt tài khoản.
    5.  Đăng nhập bằng tài khoản vừa tạo.
*   **Kết quả mong đợi:** Đăng nhập thành công, chuyển hướng vào Dashboard, lưu Token vào LocalStorage.

## 2. Quản lý Hồ sơ Sinh viên (Student Profile)
*   **Chức năng:** Cập nhật thông tin cá nhân và ảnh đại diện cho sinh viên.
*   **Các bước thực hiện:**
    1.  Vào mục "Trang cá nhân".
    2.  Nhấn "Chỉnh sửa hồ sơ".
    3.  Thay đổi thông tin: Ngày sinh, Giới tính, Địa chỉ, Trường đại học, GPA...
    4.  **Cập nhật Ảnh đại diện:** Chọn một file ảnh từ máy tính.
    5.  Nhấn "Lưu thay đổi".
*   **Kết quả mong đợi:** 
    - Thông tin được lưu vào database.
    - Ảnh đại diện hiển thị đúng ở cả trang cá nhân và thanh menu (Top navigation).
    - Khi tải lại trang, ảnh không bị mất.

## 3. Quản lý Hồ sơ Nhà tuyển dụng (Recruiter Profile)
*   **Chức năng:** Thiết lập thông tin nhà tuyển dụng và liên kết công ty.
*   **Các bước thực hiện:**
    1.  Đăng nhập với vai trò Nhà tuyển dụng.
    2.  Cập nhật vị trí công tác (Position), Phòng ban (Department) và Số điện thoại.
    3.  Liên kết hoặc tạo mới thông tin Công ty.
*   **Kết quả mong đợi:** Thông tin được cập nhật chính xác.

## 4. Nhắn tin trực tuyến (Messaging)
*   **Chức năng:** Chat thời gian thực giữa Sinh viên và Nhà tuyển dụng.
*   **Các bước thực hiện:**
    1.  **Sinh viên:** Vào trang "Công ty" -> Chọn một công ty -> Nhấn "Liên hệ".
    2.  Gửi tin nhắn đầu tiên.
    3.  **Nhà tuyển dụng:** Vào mục "Tin nhắn", kiểm tra xem có cuộc hội thoại mới không.
    4.  Nhà tuyển dụng phản hồi lại.
*   **Kết quả mong đợi:** 
    - Tin nhắn gửi và nhận thành công.
    - Hiển thị thông báo (Unread count) nếu có tin nhắn mới chưa đọc.
    - Hiển thị đúng ảnh đại diện của người đối diện.

## 5. Quản lý CV
*   **Chức năng:** Tải lên và quản lý các bản CV.
*   **Các bước thực hiện:**
    1.  Sinh viên vào mục "Hồ sơ & CV" -> "Tải CV".
    2.  Chọn file PDF/Docx.
*   **Kết quả mong đợi:** File được tải lên thành công, xuất hiện trong danh sách CV.
