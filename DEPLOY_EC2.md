# AWS EC2 배포 가이드

## 1. EC2 인스턴스 생성

### AWS 콘솔에서 설정
1. **리전**: 서울 (ap-northeast-2) 권장
2. **AMI**: Ubuntu 22.04 LTS
3. **인스턴스 타입**: t3.small 이상 권장 (Next.js 빌드에 메모리 필요)
4. **스토리지**: 20GB 이상
5. **보안 그룹**:
   - SSH (22): 내 IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - Custom TCP (3000): 0.0.0.0/0 (개발 테스트용, 나중에 제거)

### 키 페어
- 새 키 페어 생성 후 `.pem` 파일 안전하게 보관

---

## 2. EC2 접속

```bash
# 키 파일 권한 설정
chmod 400 your-key.pem

# SSH 접속
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## 3. 서버 환경 설정

### 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

### Node.js 20 설치 (NVM 사용)
```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Node.js 20 설치
nvm install 20
nvm use 20
nvm alias default 20

# 확인
node -v  # v20.x.x
npm -v
```

### pnpm 설치
```bash
npm install -g pnpm
```

### PM2 설치 (프로세스 관리)
```bash
npm install -g pm2
```

### Nginx 설치
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

---

## 4. 프로젝트 배포

### Git 클론
```bash
cd ~
git clone <YOUR_REPO_URL> sheet-app
cd sheet-app
```

### 환경 변수 설정
```bash
nano .env.local
```

아래 내용 입력:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
NEXT_PUBLIC_USE_TEST_SHEET=false
```

> **주의**: `GOOGLE_PRIVATE_KEY`는 반드시 쌍따옴표로 감싸고, 줄바꿈은 `\n`으로 유지

### 의존성 설치 및 빌드
```bash
pnpm install
pnpm build
```

---

## 5. PM2로 앱 실행

### ecosystem 파일 생성
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'sheet-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/ubuntu/sheet-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### PM2 실행
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 시스템 재부팅 시 자동 시작 설정 (출력된 명령어 실행)
```

### PM2 명령어
```bash
pm2 status          # 상태 확인
pm2 logs sheet-app  # 로그 확인
pm2 restart sheet-app  # 재시작
pm2 stop sheet-app     # 중지
```

---

## 6. Nginx 리버스 프록시 설정

### 설정 파일 생성
```bash
sudo nano /etc/nginx/sites-available/sheet-app
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 또는 EC2 퍼블릭 IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

### 설정 활성화
```bash
sudo ln -s /etc/nginx/sites-available/sheet-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # 기본 설정 제거
sudo nginx -t  # 문법 검사
sudo systemctl restart nginx
```

---

## 7. (선택) HTTPS 설정 - Let's Encrypt

도메인이 있는 경우:

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

---

## 8. 배포 업데이트 스크립트

### deploy.sh 생성
```bash
nano ~/deploy.sh
```

```bash
#!/bin/bash
cd ~/sheet-app
git pull origin main
pnpm install
pnpm build
pm2 restart sheet-app
echo "배포 완료!"
```

```bash
chmod +x ~/deploy.sh
```

업데이트 시:
```bash
~/deploy.sh
```

---

## 9. 방화벽 설정 (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 10. 모니터링

### 실시간 로그
```bash
pm2 logs sheet-app --lines 100
```

### 시스템 리소스
```bash
htop  # sudo apt install htop -y
```

### PM2 모니터링
```bash
pm2 monit
```

---

## 트러블슈팅

### 빌드 실패 (메모리 부족)
```bash
# 스왑 메모리 추가
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 502 Bad Gateway
```bash
# PM2 상태 확인
pm2 status

# 앱 재시작
pm2 restart sheet-app

# Nginx 재시작
sudo systemctl restart nginx
```

### 환경 변수 로드 안됨
```bash
# .env.local 파일 확인
cat .env.local

# PM2 재시작 (환경 변수 다시 로드)
pm2 restart sheet-app --update-env
```

### MongoDB 연결 실패
- MongoDB Atlas에서 EC2 IP를 화이트리스트에 추가
- Network Access → Add IP Address → EC2 퍼블릭 IP 또는 0.0.0.0/0

---

## 요약 명령어

```bash
# 전체 설치 (복사해서 한번에 실행)
sudo apt update && sudo apt upgrade -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pnpm pm2
sudo apt install nginx -y

# 배포
cd ~/sheet-app
git pull
pnpm install && pnpm build
pm2 restart sheet-app
```
