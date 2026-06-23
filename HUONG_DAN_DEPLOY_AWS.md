# 🚀 Hướng Dẫn Deploy CareerMate lên AWS Free Tier

> **Mục tiêu**: Deploy toàn bộ hệ thống CareerMate (microservices + frontend) lên AWS EC2 t2.micro (Free Tier) dùng Docker Compose.

---

## 📋 Yêu cầu trước khi bắt đầu

- [ ] Tài khoản AWS (Free Tier)
- [ ] Tài khoản GitHub (để push code)
- [ ] Google Cloud Console project (đã có Google OAuth)
- [ ] Gmail để gửi email (hoặc tắt mail service tạm thời)

---

## BƯỚC 1: Chuẩn Bị Google OAuth

Vì app deploy lên EC2 có IP mới, bạn cần cập nhật Google OAuth settings.

### 1.1. Lấy Google Client ID
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. Vào **APIs & Services → Credentials**
4. Click vào OAuth 2.0 Client ID của bạn
5. Chép `Client ID` (dạng `xxx.apps.googleusercontent.com`)

### 1.2. Thêm Authorized Origins (sau khi có EC2 IP)
Sau khi tạo EC2 instance (Bước 2), quay lại đây thêm:

**Authorized JavaScript origins:**
```
http://YOUR_EC2_PUBLIC_IP
http://YOUR_EC2_PUBLIC_IP:8080
```

**Authorized redirect URIs:**
```
http://YOUR_EC2_PUBLIC_IP/auth/callback
http://YOUR_EC2_PUBLIC_IP:8080/api/auth/google/callback
```

---

## BƯỚC 2: Tạo EC2 Instance

### 2.1. Tạo instance
1. Đăng nhập [AWS Console](https://console.aws.amazon.com/)
2. Vào **EC2 → Launch Instance**
3. Cấu hình:
   - **Name**: `CareerMate-Server`
   - **AMI**: `Ubuntu Server 22.04 LTS` (Free tier eligible)
   - **Instance type**: `t2.micro` ✅ (Free tier)
   - **Key pair**: Tạo mới → đặt tên `careermate-key` → Download `.pem` file
   - **Storage**: 20 GB gp2 (Free tier cho 30GB)

### 2.2. Cấu hình Security Group
Thêm các Inbound Rules sau:

| Type | Port | Source | Mục đích |
|------|------|--------|----------|
| SSH | 22 | My IP | SSH vào server |
| HTTP | 80 | 0.0.0.0/0 | Frontend |
| Custom TCP | 8080 | 0.0.0.0/0 | API Gateway |
| Custom TCP | 8761 | My IP | Eureka (chỉ cho bạn xem) |

### 2.3. Lấy Public IP
Sau khi instance chạy, vào **EC2 → Instances**, copy **Public IPv4 address**.

---

## BƯỚC 3: Push Code lên GitHub

### 3.1. Tạo `.gitignore` đúng
Đảm bảo file `.gitignore` có:
```
.env
target/
*.class
node_modules/
```

### 3.2. Push code
```bash
# Trong thư mục d:\CareerMate
git add .
git commit -m "Add Docker deployment files"
git push origin main
```

---

## BƯỚC 4: SSH vào EC2 và Setup

### 4.1. SSH vào server

**Trên Windows (PowerShell):**
```powershell
# Di chuyển file key vào thư mục .ssh
Move-Item "careermate-key.pem" "$env:USERPROFILE\.ssh\"

# Set permission (PowerShell)
icacls "$env:USERPROFILE\.ssh\careermate-key.pem" /inheritance:r /grant:r "$env:USERNAME:R"

# SSH vào EC2
ssh -i "$env:USERPROFILE\.ssh\careermate-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

### 4.2. Cài Docker & Clone repo
```bash
# Cập nhật và cài Docker
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-v2 git curl

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# QUAN TRỌNG: Đăng xuất rồi đăng nhập lại để group docker có hiệu lực
exit
# SSH lại vào EC2
```

### 4.3. Tạo Swap 2GB (QUAN TRỌNG - RAM chỉ có 1GB)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Tự động bật swap khi reboot
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Kiểm tra
free -h
```

---

## BƯỚC 5: Deploy CareerMate

### 5.1. Clone repository
```bash
cd ~
git clone https://github.com/YOUR_USERNAME/CareerMate.git
cd CareerMate
```

### 5.2. Tạo file `.env`
```bash
cp .env.example .env
nano .env
```

Điền vào các giá trị sau (thay YOUR_xxx bằng giá trị thực):
```env
DB_USERNAME=postgres
DB_PASSWORD=CareerMate2024!
JWT_SECRET=<chạy: openssl rand -base64 32>
EC2_PUBLIC_IP=YOUR_EC2_PUBLIC_IP
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
GEMINI_API_KEY=your-gemini-api-key
```

Lưu file: `Ctrl+O` → `Enter` → `Ctrl+X`

### 5.3. Tạo JWT Secret
```bash
# Tạo secret key ngẫu nhiên
openssl rand -base64 32
# Copy kết quả và dán vào JWT_SECRET trong .env
```

### 5.4. Build và chạy
```bash
# Build tất cả (lần đầu mất 15-30 phút)
docker compose build

# Khởi động tất cả services
docker compose up -d

# Theo dõi logs
docker compose logs -f
```

---

## BƯỚC 6: Kiểm Tra Hệ Thống

### 6.1. Kiểm tra services
```bash
# Xem trạng thái tất cả containers
docker compose ps

# Xem logs của từng service
docker compose logs eureka-server
docker compose logs api-gateway
docker compose logs user-service
```

### 6.2. Kiểm tra qua browser
| URL | Kiểm tra |
|-----|----------|
| `http://EC2_IP` | Frontend |
| `http://EC2_IP:8080/actuator/health` | API Gateway |
| `http://EC2_IP:8761` | Eureka Dashboard |

### 6.3. Thứ tự khởi động bình thường
Services sẽ khởi động theo thứ tự:
1. ✅ postgres → redis
2. ✅ eureka-server (chờ ~60s)
3. ✅ api-gateway
4. ✅ Tất cả microservices
5. ✅ frontend

---

## 🔧 Các Lệnh Quản Lý Hữu Ích

```bash
# Xem logs realtime
docker compose logs -f

# Restart một service
docker compose restart user-service

# Dừng tất cả
docker compose down

# Dừng và xóa data
docker compose down -v

# Cập nhật code và redeploy
git pull
docker compose build
docker compose up -d

# Xem resource usage
docker stats

# Kiểm tra RAM
free -h
```

---

## ⚠️ Lưu Ý Quan Trọng

### Về bộ nhớ (t2.micro = 1GB RAM + 2GB Swap)
- Các Java services tiêu thụ nhiều RAM
- **Tổng RAM giới hạn**: ~2.5GB (RAM + Swap)
- Nếu hệ thống bị chậm hoặc OOM: `docker compose restart` từng service một

### Về Google OAuth
- Sau khi lấy được EC2 Public IP, **phải vào Google Cloud Console** thêm IP vào Authorized Origins
- Nếu không thêm → login Google sẽ báo lỗi

### Về Email
- Nếu không có Gmail App Password, comment out mail config trong `.env`
- Chức năng email sẽ không hoạt động nhưng app vẫn chạy được

### Về domain/HTTPS
- Free Tier chỉ có HTTP, không có HTTPS
- Nếu cần HTTPS miễn phí: dùng [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/) (free)

---

## 🆘 Troubleshooting

### Lỗi "Out of Memory"
```bash
# Kiểm tra swap
free -h

# Restart services từng cái
docker compose restart eureka-server
sleep 30
docker compose restart api-gateway
```

### Lỗi Google OAuth "redirect_uri_mismatch"
→ Vào Google Cloud Console, thêm `http://YOUR_EC2_IP` vào Authorized Origins

### Build bị lỗi
```bash
# Xem chi tiết lỗi
docker compose build --no-cache 2>&1 | tee build.log
cat build.log
```

### Service không start
```bash
# Xem logs chi tiết
docker compose logs --tail=100 SERVICE_NAME
```

---

## 📞 Support

Nếu gặp vấn đề:
1. Chạy: `docker compose ps` để xem service nào lỗi
2. Chạy: `docker compose logs TEN_SERVICE` để xem lỗi chi tiết
3. Kiểm tra RAM: `free -h` và `docker stats`
