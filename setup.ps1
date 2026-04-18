# ============================================================
#  Analytical Dashboard — Автоматты орнату скрипті (Windows)
# ============================================================

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "`n>>> $msg" -ForegroundColor Cyan
}
function Write-Ok($msg) {
    Write-Host "    [OK] $msg" -ForegroundColor Green
}
function Write-Fail($msg) {
    Write-Host "    [ERROR] $msg" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor White
Write-Host "   Analytical Dashboard — Setup" -ForegroundColor White
Write-Host "============================================" -ForegroundColor White

# ----------------------------------------------------------
# 1. Алдын ала талаптарды тексеру
# ----------------------------------------------------------
Write-Step "Алдын ала талаптарды тексеру..."

# Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Ok "Node.js: $nodeVersion"
} catch {
    Write-Fail "Node.js табылмады. https://nodejs.org сайтынан жүктеп алыңыз."
    exit 1
}

# npm
try {
    $npmVersion = npm --version 2>&1
    Write-Ok "npm: $npmVersion"
} catch {
    Write-Fail "npm табылмады."
    exit 1
}

# Docker
try {
    $dockerVersion = docker --version 2>&1
    Write-Ok "Docker: $dockerVersion"
} catch {
    Write-Fail "Docker табылмады. https://docs.docker.com/desktop/windows/ сайтынан жүктеп алыңыз."
    exit 1
}

# ----------------------------------------------------------
# 2. .env файлын жасау
# ----------------------------------------------------------
Write-Step ".env файлын жасау..."

if (Test-Path ".env") {
    Write-Ok ".env файлы бар, өзгертілмейді."
} else {
    # Кездейсоқ NEXTAUTH_SECRET генерациялау
    $secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | % { [char]$_ })

    $envContent = @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/analytical_dashboard?schema=public"
NEXTAUTH_SECRET="$secret"
NEXTAUTH_URL="http://localhost:3000"
"@
    Set-Content -Path ".env" -Value $envContent -Encoding UTF8
    Write-Ok ".env файлы жасалды (NEXTAUTH_SECRET автоматты генерацияланды)."
}

# ----------------------------------------------------------
# 3. npm install
# ----------------------------------------------------------
Write-Step "Тәуелділіктерді орнату (npm install)..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Fail "npm install сәтсіз аяқталды."
    exit 1
}
Write-Ok "npm тәуелділіктері орнатылды."

# ----------------------------------------------------------
# 4. Docker PostgreSQL іске қосу
# ----------------------------------------------------------
Write-Step "PostgreSQL контейнерін іске қосу (Docker)..."

$containerStatus = docker ps -a --filter "name=analytical-dashboard-db" --format "{{.Status}}" 2>&1

if ($containerStatus -like "Up*") {
    Write-Ok "PostgreSQL контейнері жұмыс істеп тұр."
} else {
    docker-compose up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Docker Compose сәтсіз аяқталды."
        exit 1
    }
    Write-Host "    PostgreSQL іске қосылуды күтуде..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Write-Ok "PostgreSQL іске қосылды."
}

# ----------------------------------------------------------
# 5. Prisma generate
# ----------------------------------------------------------
Write-Step "Prisma client генерациялау..."
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Prisma generate сәтсіз аяқталды."
    exit 1
}
Write-Ok "Prisma client генерацияланды."

# ----------------------------------------------------------
# 6. DB schema push (миграция)
# ----------------------------------------------------------
Write-Step "Дерекқор схемасын қолдану (db push)..."
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Prisma db push сәтсіз аяқталды. Docker жұмыс істеп тұр ма?"
    exit 1
}
Write-Ok "Дерекқор схемасы сәтті қолданылды."

# ----------------------------------------------------------
# 7. Аяқталды
# ----------------------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Орнату сәтті аяқталды!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Қосымшаны іске қосу үшін:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Браузерде ашыңыз:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Бірінші рет кіру кезінде жаңа аккаунт тіркеңіз." -ForegroundColor Gray
Write-Host ""
