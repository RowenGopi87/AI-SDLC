# 🐳 Fixed MariaDB Docker Setup for Aura

## ❌ **Current Issue**
```
Access denied for user 'aura_user'@'172.18.0.1' (using password: YES)
```

This happens because Docker connects from a different network IP, but the user permissions are restricted.

## ✅ **Fixed Docker Command**

**Stop the old container first:**
```bash
docker stop aura-mariadb
docker rm aura-mariadb
```

**Run this corrected command:**
```bash
docker run --name aura-mariadb \
  -e MYSQL_ROOT_PASSWORD=aura_password_123 \
  -e MYSQL_DATABASE=aura_sdlc \
  -e MYSQL_USER=aura_user \
  -e MYSQL_PASSWORD=aura_password_123 \
  -p 3306:3306 \
  -d mariadb:latest \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

**Then run this to fix the user permissions:**
```bash
docker exec -it aura-mariadb mysql -uroot -paura_password_123 -e "
GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'%' IDENTIFIED BY 'aura_password_123';
FLUSH PRIVILEGES;
"
```

## 🔄 **Alternative: One-Line Setup**
```bash
docker run --name aura-mariadb -e MYSQL_ROOT_PASSWORD=aura_password_123 -e MYSQL_DATABASE=aura_sdlc -p 3306:3306 -d mariadb:latest && sleep 10 && docker exec aura-mariadb mysql -uroot -paura_password_123 -e "CREATE USER IF NOT EXISTS 'aura_user'@'%' IDENTIFIED BY 'aura_password_123'; GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'%'; FLUSH PRIVILEGES;"
```

## 📝 **Your .env should be:**
```bash
AURA_DB_HOST=localhost
AURA_DB_PORT=3306
AURA_DB_USER=aura_user
AURA_DB_PASSWORD=aura_password_123
AURA_DB_NAME=aura_sdlc
```

