# Hướng Dẫn Kiểm Thử: Job Service (Việc Làm & Quy Trình Tuyển Dụng)

File này tập trung vào các tính năng cốt lõi của **Job Service**: Đăng tin, Ứng tuyển và Phỏng vấn thử với chuyên gia.

## 1. Đăng tuyển Việc làm (Dành cho Nhà tuyển dụng)
*   **Chức năng:** Cho phép doanh nghiệp đăng tin tuyển dụng mới.
*   **Các bước thực hiện:**
    1.  Nhà tuyển dụng vào "Quản lý công việc" -> "Đăng tin mới".
    2.  Nhập Tiêu đề, Mô tả, Yêu cầu, Mức lương, Hạn chót.
    3.  Nhấn "Đăng bài".
*   **Kết quả mong đợi:** Bài đăng xuất hiện trong danh sách việc làm trên hệ thống.

## 2. Tìm kiếm & Xem chi tiết Việc làm (Dành cho Sinh viên)
*   **Chức năng:** Tìm kiếm và lọc công việc phù hợp.
*   **Các bước thực hiện:**
    1.  Sinh viên vào trang "Việc làm".
    2.  Sử dụng thanh tìm kiếm (nhập từ khóa).
    3.  Nhấn vào một công việc để xem chi tiết.
*   **Kết quả mong đợi:** Tìm đúng công việc theo từ khóa, trang chi tiết hiển thị đầy đủ thông tin lương, yêu cầu, công ty.

## 3. Ứng tuyển (Application Flow)
*   **Chức năng:** Gửi hồ sơ ứng tuyển tới nhà tuyển dụng.
*   **Các bước thực hiện:**
    1.  Tại trang chi tiết việc làm, nhấn "Ứng tuyển ngay".
    2.  Chọn CV từ danh sách đã tải lên.
    3.  Viết thư giới thiệu (Cover letter).
    4.  Nhấn "Xác nhận ứng tuyển".
*   **Kết quả mong đợi:** 
    - Thông báo ứng tuyển thành công.
    - Trong mục "Đã ứng tuyển", trạng thái hiển thị là "PENDING" (Đang chờ).

## 4. Quản lý Đơn ứng tuyển (Dành cho Nhà tuyển dụng)
*   **Chức năng:** Duyệt danh sách ứng viên.
*   **Các bước thực hiện:**
    1.  Nhà tuyển dụng vào "Quản lý ứng viên".
    2.  Xem danh sách các hồ sơ vừa nộp.
    3.  Nhấn "Duyệt" (Shortlist) hoặc "Từ chối".
*   **Kết quả mong đợi:** Trạng thái đơn ứng tuyển của sinh viên được cập nhật tương ứng.

## 5. Phỏng vấn thử với Chuyên gia (Mock Interview Human)
*   **Chức năng:** Đặt lịch phỏng vấn với các chuyên gia có sẵn trên hệ thống.
*   **Các bước thực hiện:**
    1.  Sinh viên vào mục "Phỏng vấn thử" -> Chọn tab "Với chuyên gia".
    2.  Mở danh sách chọn chuyên gia (Kiểm tra xem danh sách đã load được chuyên gia chưa).
    3.  Chọn một chuyên gia, nhập lời nhắn.
    4.  Nhấn "Gửi yêu cầu".
*   **Kết quả mong đợi:** 
    - Yêu cầu được gửi đi thành công.
    - Xuất hiện trong danh sách "Yêu cầu của bạn" với trạng thái "PENDING".
    - Nhà tuyển dụng nhận được yêu cầu trong mục tương ứng của họ.
