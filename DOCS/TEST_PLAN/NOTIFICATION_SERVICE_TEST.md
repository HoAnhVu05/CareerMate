# Hướng Dẫn Kiểm Thử: Notification Service (Hệ Thống Thông Báo)

Service này quản lý tất cả các thông báo trong hệ thống, giúp người dùng không bỏ lỡ sự kiện quan trọng.

## 1. Thông báo Ứng tuyển (Application Notifications)
*   **Chức năng:** Thông báo khi có thay đổi trạng thái đơn ứng tuyển.
*   **Các bước thực hiện:**
    1.  **Sinh viên:** Nộp đơn ứng tuyển vào một công việc.
    2.  **Nhà tuyển dụng:** Vào "Quản lý ứng viên" -> Thay đổi trạng thái (Reviewing, Interview, Rejected).
    3.  **Sinh viên:** Kiểm tra biểu tượng chuông ở thanh menu.
*   **Kết quả mong đợi:** 
    - Có "chấm đỏ" hoặc số badge hiển thị số thông báo chưa đọc.
    - Nhấn vào chuông, thấy thông báo: "Đơn ứng tuyển [Tên công việc] đã được cập nhật sang trạng thái [Interview]".
    - Nhấn vào thông báo -> Chuyển hướng đến trang chi tiết đơn ứng tuyển.

## 2. Thông báo Tin nhắn mới (Message Notifications)
*   **Chức năng:** Thông báo khi có tin nhắn mới từ người dùng khác.
*   **Các bước thực hiện:**
    1.  **User A:** Gửi tin nhắn cho User B.
    2.  **User B:** Kiểm tra thanh thông báo (hoặc biểu tượng tin nhắn).
*   **Kết quả mong đợi:** 
    - User B thấy thông báo "Bạn có tin nhắn mới từ [Tên User A]".
    - Click vào thông báo -> Mở trang chat với User A.
    - Số badge cập nhật chính xác (giảm đi khi đọc tin nhắn).

## 3. Thông báo Công việc mới (New Job Alerts)
*   **Chức năng:** Thông báo khi có việc làm phù hợp với profile sinh viên.
*   **Các bước thực hiện:**
    1.  **Sinh viên:** Vào "Cài đặt" -> "Thông báo việc làm" -> Bật "Nhận thông báo việc làm mới".
    2.  Chọn ngành nghề quan tâm (ví dụ: Software Development).
    3.  **Nhà tuyển dụng:** Đăng một công việc mới thuộc ngành Software Development.
*   **Kết quả mong đợi:** 
    - Sinh viên nhận được thông báo: "Có việc làm mới phù hợp với bạn: [Tên công việc]".
    - Nhấn vào thông báo -> Chuyển đến trang chi tiết công việc.

## 4. Thông báo Phỏng vấn (Interview Reminders)
*   **Chức năng:** Nhắc nhở sinh viên về lịch phỏng vấn sắp tới.
*   **Các bước thực hiện:**
    1.  **Nhà tuyển dụng:** Đặt lịch phỏng vấn cho một ứng viên (ngày + giờ).
    2.  **Hệ thống:** Tự động gửi thông báo nhắc nhở trước 24 giờ và 1 giờ trước buổi phỏng vấn.
*   **Kết quả mong đợi:** 
    - Sinh viên nhận thông báo: "Nhắc nhở: Bạn có buổi phỏng vấn vào [Ngày giờ] tại [Địa điểm]".
    - Thông báo có nút "Thêm vào lịch" (optional).

## 5. Quản lý Thông báo (Notification Management)
*   **Chức năng:** Người dùng có thể quản lý thông báo của mình.
*   **Các bước thực hiện:**
    1.  Nhấn vào biểu tượng chuông -> "Xem tất cả".
    2.  Đánh dấu một thông báo là đã đọc (Mark as read).
    3.  Xóa thông báo cũ không cần thiết.
    4.  Bật/Tắt các loại thông báo trong phần "Cài đặt".
*   **Kết quả mong đợi:** 
    - Thông báo đã đọc chuyển sang màu xám hoặc mờ hơn.
    - Số badge giảm dần khi đánh dấu đã đọc.
    - Người dùng có thể tắt một số loại thông báo không muốn nhận.

## 6. Kỹ thuật nâng cao (Technical Highlights)
*   **Real-time Updates:** Sử dụng WebSocket hoặc Server-Sent Events (SSE) để push thông báo real-time.
*   **Push Notifications:** Tích hợp Firebase Cloud Messaging (FCM) để gửi thông báo đến mobile app.
*   **Email Fallback:** Nếu người dùng không online, gửi thông báo qua email.
*   **Notification Queue:** Sử dụng Message Queue (RabbitMQ/Kafka) để xử lý thông báo bất đồng bộ, tránh làm chậm các service khác.
