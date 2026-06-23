# Hướng Dẫn Kiểm Thử: Admin Service (Quản Trị Hệ Thống)

Service dành riêng cho Admin để giám sát, quản lý toàn bộ hệ thống CareerMate.

## 1. Dashboard Tổng quan (Admin Dashboard)
*   **Chức năng:** Hiển thị các chỉ số quan trọng của hệ thống.
*   **Các bước thực hiện:**
    1.  Đăng nhập với tài khoản Admin.
    2.  Vào trang "Dashboard".
*   **Kết quả mong đợi:** 
    - Hiển thị các thống kê:
      - Tổng số người dùng (Students, Recruiters).
      - Số việc làm đang hoạt động.
      - Số đơn ứng tuyển trong tháng.
      - Số bài viết đã xuất bản.
    - Biểu đồ tăng trưởng người dùng theo thời gian (Line chart).
    - Top 5 công ty có nhiều việc làm nhất.

## 2. Quản lý Người dùng (User Management)
*   **Chức năng:** Admin có thể xem, chỉnh sửa và khóa/mở khóa tài khoản.
*   **Các bước thực hiện:**
    1.  Vào "Quản lý người dùng".
    2.  Xem danh sách tất cả users (có phân trang).
    3.  Tìm kiếm user theo email hoặc tên.
    4.  Nhấn "Xem chi tiết" một user.
    5.  Thực hiện các thao tác:
       - Đổi role (Student -> Recruiter, v.v.)
       - Khóa tài khoản (Status = SUSPENDED)
       - Xóa tài khoản (Status = DELETED)
*   **Kết quả mong đợi:** 
    - User bị khóa không thể đăng nhập được nữa.
    - Lịch sử hoạt động của user được lưu lại để audit.

## 3. Kiểm duyệt Nội dung (Content Moderation)
*   **Chức năng:** Duyệt các bài đăng, đánh giá công ty, comment để ngăn spam/vi phạm.
*   **Các bước thực hiện:**
    1.  Vào "Kiểm duyệt nội dung".
    2.  Xem danh sách các nội dung được báo cáo (Reported content).
    3.  Nhấn vào một item để xem chi tiết.
    4.  Quyết định: Duyệt (Approve) hoặc Xóa (Delete).
*   **Kết quả mong đợi:** 
    - Nội dung bị xóa không còn hiển thị trên hệ thống.
    - User vi phạm nhiều lần có thể bị cảnh báo hoặc khóa tài khoản.

## 4. Quản lý Công việc & Công ty (Job & Company Management)
*   **Chức năng:** Admin có thể ẩn/hiện việc làm hoặc công ty không hợp lệ.
*   **Các bước thực hiện:**
    1.  Vào "Quản lý công việc" hoặc "Quản lý công ty".
    2.  Xem danh sách tất cả jobs/companies.
    3.  Tìm kiếm theo tiêu chí (tên, trạng thái).
    4.  Đánh dấu một công việc/công ty là "Ẩn" (Hidden) nếu vi phạm.
*   **Kết quả mong đợi:** 
    - Công việc/Công ty bị ẩn không hiển thị cho sinh viên.
    - Nhà tuyển dụng nhận thông báo về lý do bị ẩn.

## 5. Xem Logs & Activity (System Logs)
*   **Chức năng:** Xem lịch sử hoạt động của hệ thống để debug hoặc audit.
*   **Các bước thực hiện:**
    1.  Vào "System Logs".
    2.  Lọc theo: Service (User, Job, AI...), Level (INFO, ERROR), Time range.
    3.  Xem chi tiết một log entry.
*   **Kết quả mong đợi:** 
    - Log hiển thị đầy đủ: Timestamp, Service name, Message, User ID (nếu có).
    - Có thể export logs ra file CSV/JSON để phân tích.

## 6. Cấu hình Hệ thống (System Configuration)
*   **Chức năng:** Thay đổi các thiết lập toàn hệ thống.
*   **Các bước thực hiện:**
    1.  Vào "Cài đặt hệ thống".
    2.  Chỉnh sửa các config:
       - Thời gian tự động xóa dữ liệu cũ (Data retention).
       - Giới hạn số lượng CV upload/user.
       - Bật/Tắt tính năng AI Mock Interview.
    3.  Nhấn "Lưu cấu hình".
*   **Kết quả mong đợi:** 
    - Thay đổi có hiệu lực ngay lập tức hoặc sau khi restart service.
    - Có log ghi lại ai đã thay đổi config gì và khi nào.

## 7. Kỹ thuật nâng cao (Technical Highlights)
*   **Role-Based Access Control (RBAC):** Chỉ tài khoản có role ADMIN mới truy cập được Admin Service.
*   **Audit Trail:** Mọi thao tác của Admin đều được ghi log để truy vết.
*   **Aggregated Data:** Dashboard lấy dữ liệu từ nhiều service khác qua Feign Client hoặc Message Queue.
*   **Security:** Admin endpoints phải có bảo mật cao, có thể yêu cầu 2FA (Two-Factor Authentication).
