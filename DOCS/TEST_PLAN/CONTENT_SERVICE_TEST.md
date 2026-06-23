# Hướng Dẫn Kiểm Thử: Content Service (Nội Dung & Doanh Nghiệp)

Service này quản lý tất cả nội dung tĩnh: thông tin công ty, bài viết, tin tức và đánh giá.

## 1. Quản lý Thông tin Công ty (Company Management)
*   **Chức năng:** Tạo, cập nhật và hiển thị hồ sơ doanh nghiệp.
*   **Các bước thực hiện:**
    1.  **Nhà tuyển dụng:** Vào "Hồ sơ công ty" -> "Chỉnh sửa thông tin".
    2.  Nhập/Cập nhật: Tên công ty, Mô tả, Địa chỉ, Website, Quy mô (số nhân viên).
    3.  **Upload Logo công ty:** Chọn file ảnh từ máy tính.
    4.  Nhấn "Lưu thay đổi".
*   **Kết quả mong đợi:** 
    - Thông tin công ty được lưu vào database.
    - Logo hiển thị đúng ở trang công ty và trong danh sách việc làm.
    - Khi sinh viên xem chi tiết công việc, logo và tên công ty hiển thị chính xác.

## 2. Danh sách & Tìm kiếm Công ty
*   **Chức năng:** Sinh viên có thể duyệt và tìm kiếm các công ty.
*   **Các bước thực hiện:**
    1.  Sinh viên vào trang "Khám phá công ty".
    2.  Xem danh sách các công ty đang tuyển dụng.
    3.  Sử dụng thanh tìm kiếm để lọc theo tên hoặc ngành nghề.
    4.  Nhấn vào một công ty để xem chi tiết.
*   **Kết quả mong đợi:** 
    - Hiển thị đầy đủ thông tin: Logo, tên, mô tả, số việc làm đang tuyển.
    - Trang chi tiết công ty hiển thị: About, Culture, Benefits, Jobs.

## 3. Đánh giá Công ty (Company Reviews)
*   **Chức năng:** Sinh viên có thể đánh giá và nhận xét về công ty.
*   **Các bước thực hiện:**
    1.  Sinh viên vào trang chi tiết công ty.
    2.  Cuộn xuống phần "Đánh giá".
    3.  Nhấn "Viết đánh giá".
    4.  Chọn số sao (1-5), nhập tiêu đề và nội dung đánh giá.
    5.  Nhấn "Gửi đánh giá".
*   **Kết quả mong đợi:** 
    - Đánh giá xuất hiện trong danh sách reviews của công ty.
    - Điểm trung bình (Average Rating) được cập nhật.
    - Chỉ sinh viên đã từng ứng tuyển hoặc làm việc mới được đánh giá (nếu có validate).

## 4. Quản lý Bài viết (Articles & Blog)
*   **Chức năng:** Hệ thống hiển thị các bài viết hữu ích về tuyển dụng, phát triển sự nghiệp.
*   **Các bước thực hiện:**
    1.  **Admin:** Vào "Quản lý nội dung" -> "Bài viết".
    2.  Nhấn "Tạo bài viết mới".
    3.  Nhập: Tiêu đề, Nội dung (hỗ trợ Markdown/HTML), Ảnh đại diện, Tags.
    4.  Chọn trạng thái: Draft (Nháp) hoặc Published (Xuất bản).
    5.  Nhấn "Lưu".
*   **Kết quả mong đợi:** 
    - Bài viết Published xuất hiện trong trang "Tin tức" của sinh viên.
    - Bài viết Draft chỉ admin mới thấy.
    - Hỗ trợ phân loại theo Tags (ví dụ: #CareerTips, #InterviewSkills).

## 5. Kỹ thuật nâng cao (Technical Highlights)
*   **Caching:** Thông tin công ty được cache để giảm tải database khi nhiều người truy cập.
*   **Image Optimization:** Logo và ảnh bài viết được tự động resize/compress.
*   **Search Indexing:** Tích hợp Elasticsearch (hoặc tương tự) để tìm kiếm công ty/bài viết nhanh hơn.
*   **Feign Client Integration:** Content Service cung cấp API cho các service khác (User, Job) để lấy thông tin công ty.
