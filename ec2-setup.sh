#!/bin/bash
# ============================================================
# CareerMate – EC2 Setup Script
# Chạy script này trên EC2 instance sau khi SSH vào
# OS: Amazon Linux 2023 / Ubuntu 22.04
# ============================================================

set -e  # Dừng nếu có lỗi

echo "========================================"
echo "  CareerMate EC2 Setup Script"
echo "========================================"

# ── 1. Cập nhật hệ thống ─────────────────────────────────
echo "[1/7] Cập nhật hệ thống..."
if [ -f /etc/debian_version ]; then
    # Ubuntu
    sudo apt-get update -y
    sudo apt-get install -y curl git docker.io docker-compose-v2
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker ubuntu
elif [ -f /etc/redhat-release ]; then
    # Amazon Linux
    sudo yum update -y
    sudo yum install -y curl git docker
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker ec2-user
    
    # Docker Compose v2 cho Amazon Linux
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
      -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Docker đã được cài đặt"

# ── 2. Tạo Swap file 2GB (t2.micro chỉ có 1GB RAM) ───────
echo "[2/7] Tạo swap file 2GB..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap 2GB đã được tạo"
else
    echo "⏭️  Swap file đã tồn tại, bỏ qua"
fi

# Kiểm tra swap
free -h

# ── 3. Cấu hình Docker daemon ─────────────────────────────
echo "[3/7] Cấu hình Docker daemon..."
sudo mkdir -p /etc/docker
cat << 'EOF' | sudo tee /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
sudo systemctl restart docker
echo "✅ Docker daemon đã được cấu hình"

# ── 4. Clone repository ───────────────────────────────────
echo "[4/7] Clone repository..."
cd /home/$(whoami)

if [ -d "CareerMate" ]; then
    echo "📁 Thư mục CareerMate đã tồn tại, cập nhật..."
    cd CareerMate
    git pull
else
    echo "📥 Clone repository..."
    # THAY THẾ URL DƯỚI ĐÂY bằng URL repo của bạn
    git clone https://github.com/YOUR_USERNAME/CareerMate.git
    cd CareerMate
fi

echo "✅ Repository đã sẵn sàng"

# ── 5. Tạo file .env ──────────────────────────────────────
echo "[5/7] Kiểm tra file .env..."
if [ ! -f .env ]; then
    echo "⚠️  File .env chưa tồn tại!"
    echo "   Hãy tạo file .env từ .env.example và điền các giá trị:"
    echo ""
    echo "   nano .env"
    echo ""
    cat .env.example
    echo ""
    echo "❗ Nhớ điền đầy đủ các biến rồi chạy lại script này"
    exit 1
else
    echo "✅ File .env đã tồn tại"
fi

# ── 6. Build & Start services ─────────────────────────────
echo "[6/7] Build và khởi động services..."
echo "⏳ Quá trình build có thể mất 15-30 phút lần đầu..."

docker compose build --no-cache
docker compose up -d

echo "✅ Tất cả services đã được khởi động"

# ── 7. Kiểm tra trạng thái ────────────────────────────────
echo "[7/7] Kiểm tra trạng thái..."
sleep 10
docker compose ps

echo ""
echo "========================================"
echo "  ✅ Setup hoàn thành!"
echo "========================================"
echo ""
echo "  🌐 Frontend:    http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "  🔧 API Gateway: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "  📊 Eureka:      http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8761"
echo ""
echo "  📝 Xem logs: docker compose logs -f"
echo ""
