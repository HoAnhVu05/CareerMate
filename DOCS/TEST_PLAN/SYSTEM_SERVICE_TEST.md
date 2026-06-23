# Hướng Dẫn Kiểm Thử: Content & System (Doanh nghiệp, Tin tức & Cổng Gateway)

Bao gồm các chức năng về thông tin doanh nghiệp, bài viết và tính ổn định của hệ thống.

## 1. Thông tin Doanh nghiệp (Company)
*   **Chức năng:** Hiển thị profile công ty và đánh giá.
*   **Các bước thực hiện:**
    1.  Vào "Danh sách công ty".
    2.  Xem các công ty nổi bật kèm Logo.
    3.  Nhấn xem chi tiết một công ty.
    4.  Thực hiện "Đánh giá công ty" (Rating/Review) nếu đã đăng nhập.
*   **Kết quả mong đợi:** Logo hiển thị rõ nét, các bài đăng tuyển của công ty đó cũng xuất hiện trong trang chi tiết.

## 2. Tin tức & Diễn đàn (Articles/Blog)
*   **Chức năng:** Chia sẻ kinh nghiệm và kiến thức.
*   **Các bước thực hiện:**
    1.  Vào mục "Tin tức" hoặc "Khám phá".
    2.  Đọc một bài viết.
    3.  Nhấn "Thích" (Like) hoặc để lại "Bình luận".
*   **Kết quả mong đợi:** Lượt tương tác được cập nhật, bình luận hiển thị theo thời gian thực.

## 3. Quản trị hệ thống (Admin Console)
*   **Chức năng:** Quản lý tập trung tài khoản và nội dung (Dành cho Admin).
*   **Các bước thực hiện:**
    1.  Đăng nhập bằng tài khoản Admin.
    2.  Vào mục "Quản lý người dùng": Khóa/Mở khóa tài khoản.
    3.  Vào "Duyệt bài viết": Ẩn/Hiện các bài đăng vi phạm.
    4.  Xem "Thống kê": Biểu đồ tăng trưởng người dùng, việc làm.
*   **Kết quả mong đợi:** Các thao tác quản trị có hiệu lực ngay lập tức lên các service khác.

## 4. Kiểm tra Hệ thống (System Integrity - Dành cho Demo kỹ thuật)
*   **Service Discovery (Eureka Server):**
    - Truy cập `http://localhost:8761`.
    - Kiểm tra xem tất cả các microservices (USER, JOB, AI, CONTENT, ...) đã đăng ký (UP) chưa.
*   **API Gateway:**
    - Mọi yêu cầu từ Frontend đều qua cổng 8080. Kiểm tra Network trong trình duyệt để thấy các API đều gọi về `http://localhost:8080/api/...`.
*   **Tài nguyên tĩnh (Static Resources):**
    - Kiểm tra xem ảnh đại diện người dùng, logo công ty có tải được từ đường dẫn `/api/uploads/...` thông qua gateway không.
*   **Thông báo (Notifications):**
    - Khi có tin nhắn mới hoặc đơn ứng tuyển được duyệt, kiểm tra quả chuông thông báo ở thanh menu có hiện số không.
