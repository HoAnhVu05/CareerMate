# Hướng Dẫn Kiểm Thử Hệ Thống CareerMate

Tài liệu này tổng hợp các kịch bản kiểm thử cho toàn bộ hệ thống CareerMate, được tổ chức theo từng microservice.

## 📋 Tổng Quan Kiến Trúc

CareerMate sử dụng kiến trúc **Microservices** với các service độc lập:

```
┌─────────────────────────────────────────────────────────┐
│                     API Gateway (8080)                    │
│              (Routing, Authentication, CORS)              │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼───────┐
│ User Service │ │Job Service│ │  AI Service  │
│   (8081)     │ │  (8082)   │ │   (8083)     │
└──────────────┘ └───────────┘ └──────────────┘
        │               │               │
┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼───────┐
│Learning Svc  │ │Content Svc│ │ Notification │
│   (8084)     │ │  (8085)   │ │     (8086)   │
└──────────────┘ └───────────┘ └──────────────┘
        │               │
┌───────▼──────────────▼────────┐
│     Eureka Server (8761)      │
│    (Service Discovery)        │
└───────────────────────────────┘
```

## 📚 Chi Tiết Từng Service

### 1. [User Service](./USER_SERVICE_TEST.md) 
**Port:** 8081 | **Database:** userservice

Quản lý người dùng, xác thực và hồ sơ cá nhân.

**Tính năng chính:**
- ✅ Đăng ký, Đăng nhập với JWT
- ✅ Quản lý hồ sơ Sinh viên / Nhà tuyển dụng
- ✅ Upload ảnh đại diện
- ✅ Nhắn tin trực tuyến (Messaging)
- ✅ Quản lý CV

---

### 2. [Job Service](./JOB_SERVICE_TEST.md)
**Port:** 8082 | **Database:** jobservice

Quản lý việc làm và quy trình tuyển dụng.

**Tính năng chính:**
- ✅ Đăng tin tuyển dụng
- ✅ Tìm kiếm & Lọc việc làm
- ✅ Ứng tuyển công việc
- ✅ Quản lý trạng thái đơn ứng tuyển
- ✅ Phỏng vấn thử với chuyên gia (Mock Interview Human)

---

### 3. [AI Service](./AI_SERVICE_TEST.md)
**Port:** 8083 | **Database:** aiservice

Tích hợp trí tuệ nhân tạo để hỗ trợ sinh viên.

**Tính năng chính:**
- 🤖 Phỏng vấn thử với AI (AI Mock Interview)
- 📄 Phân tích CV bằng AI (ATS Score)
- 🗺️ Tạo lộ trình nghề nghiệp (Career Roadmap)
- 💡 Gợi ý việc làm thông minh

---

### 4. [Learning Service](./LEARNING_SERVICE_TEST.md)
**Port:** 8084 | **Database:** learningservice

Hệ thống học tập trực tuyến (LMS).

**Tính năng chính:**
- 📚 Quản lý khóa học
- 🎥 Xem video bài giảng
- ✍️ Làm bài kiểm tra (Quiz)
- 📊 Theo dõi tiến độ học tập
- 🏆 Cấp chứng chỉ hoàn thành

---

### 5. [Content Service](./CONTENT_SERVICE_TEST.md)
**Port:** 8085 | **Database:** contentservice

Quản lý nội dung tĩnh: công ty, bài viết, tin tức.

**Tính năng chính:**
- 🏢 Quản lý thông tin công ty
- ⭐ Đánh giá công ty (Company Reviews)
- 📰 Quản lý bài viết & Blog
- 🔍 Tìm kiếm công ty

---

### 6. [Notification Service](./NOTIFICATION_SERVICE_TEST.md)
**Port:** 8086 | **Database:** notificationservice

Hệ thống thông báo real-time.

**Tính năng chính:**
- 🔔 Thông báo đơn ứng tuyển
- 💬 Thông báo tin nhắn mới
- 📢 Thông báo việc làm mới
- ⏰ Nhắc nhở lịch phỏng vấn
- 📧 Email notifications

---

### 7. [Admin Service](./ADMIN_SERVICE_TEST.md)
**Port:** 8087 | **Database:** adminservice

Quản trị và giám sát hệ thống.

**Tính năng chính:**
- 📊 Dashboard tổng quan
- 👥 Quản lý người dùng
- 🛡️ Kiểm duyệt nội dung
- 📝 Xem system logs
- ⚙️ Cấu hình hệ thống

---

### 8. [System Infrastructure](./SYSTEM_SERVICE_TEST.md)
**Eureka:** 8761 | **API Gateway:** 8080

Hạ tầng hệ thống và cổng API.

**Tính năng chính:**
- 🌐 Service Discovery (Eureka)
- 🔐 API Gateway (Routing & Auth)
- 🔄 Load Balancing
- 📡 Inter-service Communication (Feign)

---

## 🎯 Quy Trình Demo Đầy Đủ

### Luồng 1: Sinh Viên Tìm Việc
1. Đăng ký tài khoản → Xác thực OTP
2. Hoàn thiện hồ sơ cá nhân → Upload avatar
3. Tìm kiếm việc làm → Xem chi tiết công ty
4. Ứng tuyển công việc → Theo dõi trạng thái
5. Nhận thông báo khi có cập nhật

### Luồng 2: Luyện Tập Phỏng Vấn
1. Phỏng vấn thử với AI → Nhận đánh giá
2. Hoặc đặt lịch với chuyên gia → Mock interview
3. Học các khóa học kỹ năng → Làm quiz
4. Nhận chứng chỉ hoàn thành

### Luồng 3: Nhà Tuyển Dụng
1. Đăng nhập → Tạo/Liên kết công ty
2. Đăng tin tuyển dụng → Chờ ứng viên
3. Quản lý đơn ứng tuyển → Thay đổi trạng thái
4. Nhắn tin với ứng viên → Sắp xếp phỏng vấn
5. Xem thống kê tuyển dụng

### Luồng 4: Admin Quản Trị
1. Xem dashboard tổng quan → Thống kê hệ thống
2. Kiểm duyệt nội dung vi phạm
3. Quản lý user (khóa/mở tài khoản)
4. Xem logs để debug lỗi

---

## 🔧 Các Tính Năng Kỹ Thuật Đặc Biệt

### Authentication & Security
- JWT Token với refresh mechanism
- Role-based access control (RBAC)
- Password hashing với BCrypt
- CORS configuration tại API Gateway

### Microservices Communication
- **Feign Client:** Gọi API giữa các service
- **Eureka:** Service discovery tự động
- **API Gateway:** Single entry point, routing thông minh

### Performance & Scalability
- **Caching:** Redis cache cho dữ liệu thường xuyên truy cập
- **Pagination:** Giảm tải khi query danh sách lớn
- **Lazy Loading:** Fetch ảnh/video khi cần

### AI Integration
- Google Gemini API cho mock interview
- NLP để phân tích CV
- Machine Learning cho job recommendations

---

## 📝 Ghi Chú Quan Trọng

**Trước khi demo:**
1. ✅ Đảm bảo tất cả services đã start (check Eureka Dashboard)
2. ✅ Test API Gateway routing: `curl http://localhost:8080/api/users/health`
3. ✅ Chuẩn bị dữ liệu mẫu (seeder data)
4. ✅ Kiểm tra database connections

**Các endpoint quan trọng:**
- Eureka: http://localhost:8761
- API Gateway: http://localhost:8080
- Frontend: http://localhost:5173
- Health checks: `http://localhost:808X/actuator/health`

**Troubleshooting:**
- Nếu service không lên: Check logs trong `backend/microservices/[service-name]/logs/`
- Nếu CORS error: Kiểm tra CORS config trong API Gateway
- Nếu 401 Unauthorized: Token hết hạn, đăng nhập lại

---

## 📧 Liên Hệ

Nếu gặp vấn đề khi test, vui lòng check:
1. File logs của từng service
2. Console output của Frontend
3. Network tab trong Browser DevTools
4. Eureka Dashboard để xem service nào down

**Chúc bạn demo thành công!** 🎉
