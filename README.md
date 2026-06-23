# CareerMate - Hệ Thống Quản Lý Nghề Nghiệp

Hệ thống quản lý nghề nghiệp cho sinh viên, nhà tuyển dụng và quản trị viên.

## 🚀 Bắt Đầu Nhanh

### Yêu Cầu
- Java JDK 17+ (khuyến nghị JDK 23)
- Maven 3.6+
- PostgreSQL 12+
- Node.js 18+
- npm hoặc yarn

### Cài Đặt

1. **Setup Database:**
   ```powershell
   # Chạy SQL scripts
   psql -U postgres -f TAO_DATABASE.sql
   psql -U postgres -d careermate_db -f TAO_BANG_CHUC_NANG_SINH_VIEN.sql
   ```

2. **Chạy Backend:**
   ```powershell
   .\CHAY_BACKEND.ps1
   ```

3. **Chạy Frontend:**
   ```powershell
   .\CHAY_FRONTEND.ps1
   ```

4. **Hoặc chạy tất cả:**
   ```powershell
   .\CHAY_TAT_CA.ps1 -ApiKey "YOUR_OPENROUTER_API_KEY"
   ```

## 📚 Tài Liệu

- **Hướng dẫn chi tiết:** [HUONG_DAN_CHAY_PROJECT.md](HUONG_DAN_CHAY_PROJECT.md)
- **Thông tin AI API:** [GEMINI_MODEL_TEST_RESULTS.md](GEMINI_MODEL_TEST_RESULTS.md)

## 🛠️ Cấu Trúc Project

```
CareerMate/
├── backend/          # Spring Boot Backend
│   ├── src/         # Source code
│   └── pom.xml      # Maven dependencies
├── frontend/         # React Frontend
│   ├── src/         # Source code
│   └── package.json # npm dependencies
├── CHAY_BACKEND.ps1      # Script chạy backend
├── CHAY_FRONTEND.ps1     # Script chạy frontend
├── CHAY_TAT_CA.ps1       # Script setup toàn bộ
├── TEST_OPENROUTER_API.ps1 # Script test API
├── TAO_DATABASE.sql       # SQL tạo database
└── TAO_BANG_CHUC_NANG_SINH_VIEN.sql # SQL tạo bảng
```

## 🔑 API Configuration

Project sử dụng OpenRouter API. Cấu hình trong:
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-dev.yml`

## 📋 Xem Log

### Xem log cơ bản:
```powershell
.\XEM_LOG.ps1                    # Xem 50 dòng cuối
.\XEM_LOG.ps1 -Lines 100         # Xem 100 dòng cuối
.\XEM_LOG.ps1 -Follow            # Theo dõi real-time
.\XEM_LOG.ps1 -Error              # Chỉ xem lỗi
.\XEM_LOG.ps1 -Filter "CV"        # Lọc theo keyword
```

### Xem lỗi:
```powershell
.\XEM_LOG_ERROR.ps1              # Chỉ xem lỗi và exceptions
```

### Theo dõi real-time:
```powershell
.\XEM_LOG_THEO_DOI.ps1           # Theo dõi log mới (Ctrl+C để dừng)
```

### Tìm kiếm:
```powershell
.\TIM_KIEM_LOG.ps1 -Keyword "CV" # Tìm kiếm trong log
```

### Xóa log cũ:
```powershell
.\XOA_LOG_CU.ps1                 # Xóa các file log cũ (giữ lại log hiện tại)
```

**Log file location:** `backend/logs/careermate.log`

## 📝 License

MIT
