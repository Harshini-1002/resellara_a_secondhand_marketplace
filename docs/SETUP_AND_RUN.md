# Setup and Run Guide — Resellara (Windows)

> **Navigation:** [README](README.md) · [Architecture](ARCHITECTURE.md) · [Frontend](FRONTEND.md) · [Backend](BACKEND.md) · [Security](SECURITY.md)

This guide is written for Windows. All commands use PowerShell unless stated otherwise.

---

## Required Software

| Software | Minimum Version | How to Verify |
|----------|----------------|--------------|
| Java JDK | 21 | `java -version` → should show `21` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| MySQL Community Server | 8.0 | `mysql --version` |
| Git | Any | `git --version` |

**Do NOT install Maven globally** — the project uses `mvnw.cmd` (Maven Wrapper) which downloads Maven automatically.

### Installing Java 21

1. Download from [https://adoptium.net](https://adoptium.net) — choose **Temurin JDK 21**.
2. Run the installer and select "Set JAVA_HOME variable" during installation.
3. Verify: open a new PowerShell and run `java -version`.

### Installing Node.js

1. Download from [https://nodejs.org](https://nodejs.org) — LTS version.
2. npm is included with Node.js.

### Installing MySQL 8.0

1. Download MySQL Community Server from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/).
2. During installation: set a root password and note it down securely.
3. Choose "Developer Default" or "Server only".

---

## MySQL Database Setup

> **Never paste your password into chat, documentation, or version control.**

### Step 1: Log into MySQL as root

Open PowerShell or MySQL Workbench and run:
```powershell
mysql -u root -p
# Enter your root password when prompted
```

### Step 2: Create a dedicated application user

```sql
CREATE USER 'sellara_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON sellara_db.* TO 'sellara_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Replace `YourStrongPassword123!` with your own strong password.

The database `sellara_db` will be created automatically by Spring Boot on first startup. You do **not** need to create it manually.

---

## Configure Environment Variables (Windows)

Environment variables keep your credentials out of source code. Set them using the Windows System Properties UI (persistent across sessions):

### Using PowerShell (Persistent for current user)

```powershell
[Environment]::SetEnvironmentVariable("DB_USERNAME", "sellara_user", "User")
[Environment]::SetEnvironmentVariable("DB_PASSWORD", "YourStrongPassword123!", "User")
[Environment]::SetEnvironmentVariable("RESELLARA_SMTP_PASSWORD", "your_gmail_app_password", "User")
```

After setting, **open a new PowerShell window** for the variables to take effect.

### Verify Variables Are Set

```powershell
echo $env:DB_USERNAME
echo $env:DB_PASSWORD
```

### SMTP Email Configuration (Optional)

To enable OTP email delivery:
1. Use a Gmail account.
2. Enable 2-Factor Authentication on the Gmail account.
3. Generate an **App Password**: Google Account → Security → App Passwords.
4. Set `RESELLARA_SMTP_PASSWORD` to the 16-character App Password (no spaces).
5. `RESELLARA_SMTP_USERNAME` defaults to `23r01a05t9@gmail.com` in `application.properties` — you can override it:
   ```powershell
   [Environment]::SetEnvironmentVariable("RESELLARA_SMTP_USERNAME", "youremail@gmail.com", "User")
   ```

> If SMTP is not configured, OTP emails will fail but the server will still start. Registration and password reset will not work.

---

## Backend Configuration

The backend reads configuration from [`application.properties`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/resources/application.properties):

```properties
# Server port
server.port=8080

# Database — all sensitive values from environment variables
spring.datasource.url=jdbc:mysql://localhost:3306/sellara_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}

# Hibernate — updates schema on startup; does NOT drop data
spring.jpa.hibernate.ddl-auto=update
```

**You do not need to edit this file.** The environment variables override the defaults.

---

## Install Frontend Dependencies

```powershell
cd C:\Users\harsh\.gemini\antigravity\scratch\sellara\frontend
npm install
```

This downloads all dependencies listed in `package.json` into `node_modules/`. Only needed once (or after `package.json` changes).

---

## Running the Application

### Method 1: Use the Batch Files (Recommended)

Open two separate PowerShell windows.

**Window 1 — Start Backend:**
```powershell
cd C:\Users\harsh\.gemini\antigravity\scratch\sellara
.\run-backend.bat
```

**Window 2 — Start Frontend:**
```powershell
cd C:\Users\harsh\.gemini\antigravity\scratch\sellara
.\run-frontend.bat
```

### Method 2: Manual Commands

**Backend:**
```powershell
cd C:\Users\harsh\.gemini\antigravity\scratch\sellara\backend
.\mvnw.cmd spring-boot:run
```

**Frontend:**
```powershell
cd C:\Users\harsh\.gemini\antigravity\scratch\sellara\frontend
npm run dev
```

---

## Local URLs and Ports

| Service | URL | Port |
|---------|-----|------|
| React Frontend | `http://localhost:5173` | 5173 |
| Spring Boot API | `http://localhost:8080` | 8080 |
| MySQL | `localhost` | 3306 |
| API Health Check | `http://localhost:8080/api/categories` | — |

---

## Verifying the Application is Running

### Backend is running when you see:
```
Started SellaraBackendApplication in X.XXX seconds
Tomcat started on port 8080
```

Test it directly:
```powershell
curl http://localhost:8080/api/categories
# Should return JSON with category list
```

### Frontend is running when you see:
```
  VITE v8.3.0  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser — you should see the Resellara homepage.

---

## Stopping and Restarting

- Press **Ctrl+C** in the respective PowerShell window to stop either server.
- Close the window to stop immediately.
- Restart by running the batch files again.

**Data is NOT lost when you stop the application.** MySQL stores all data on disk.

---

## Troubleshooting

### Backend won't start — `Access denied for user`
- The `DB_USERNAME` or `DB_PASSWORD` environment variable is wrong or not set.
- Open a fresh PowerShell window (not the one where you set the variable).
- Verify: `echo $env:DB_USERNAME` and `echo $env:DB_PASSWORD`.
- Re-run grant commands in MySQL if needed.

### Backend won't start — `Communications link failure`
- MySQL is not running.
- Start MySQL: open Windows Services (`services.msc`), find "MySQL80", click Start.

### Backend won't start — `Port 8080 already in use`
- Another application is using port 8080.
- Find and kill it: `netstat -aon | findstr 8080` → note PID → `taskkill /PID <PID> /F`.

### Frontend can't connect to API (CORS error in browser console)
- Backend is not running.
- Start the backend first, then the frontend.

### Frontend: `npm install` fails
- Check Node.js is installed: `node --version`.
- Check internet connection (downloads from npm registry).
- Try: `npm install --legacy-peer-deps` if there are peer dependency conflicts.

### OTP emails not received
- `RESELLARA_SMTP_PASSWORD` env var not set or wrong.
- Gmail "Less secure app access" or App Password not configured.
- Check backend console for mail error: `Could not connect to SMTP host`.
- Check spam folder.

### `mvnw.cmd` not found
- Ensure you are in the `backend/` directory.
- The Maven Wrapper file (`mvnw.cmd`) ships with the project and does not need separate installation.

### Hibernate schema error on startup
- If you see `Schema-validation: missing table`, this means `ddl-auto` is set to `validate` instead of `update`. Check `application.properties` — it should say `update`.

### `java.lang.UnsupportedClassVersionError`
- The installed JDK is older than Java 21.
- Install JDK 21 and set `JAVA_HOME`.

---

## How to Avoid Losing Database Data

- Do not drop the `sellara_db` database.
- Do not set `spring.jpa.hibernate.ddl-auto=create` or `create-drop` — this would wipe all data.
- The current setting `update` only adds new columns/tables; it never deletes existing data.
- Back up regularly:
  ```powershell
  mysqldump -u sellara_user -p sellara_db > C:\backups\sellara_backup.sql
  ```
