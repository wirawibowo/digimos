# ============================================================
#  DigiMOS - Build Bundle Script
#  Membuat digimos-bundle.tar.gz untuk deploy ke STB
# ============================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BundleDir = Join-Path $ProjectRoot "digimos-bundle"
$OutputFile = Join-Path $ProjectRoot "digimos-bundle.tar.gz"

Write-Host ""
Write-Host "=== DigiMOS Bundle Builder ===" -ForegroundColor Cyan
Write-Host ""

# 1. Build app
Write-Host "[1/4] Building app..." -ForegroundColor Yellow
Push-Location $ProjectRoot
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    Write-Host "  Build OK" -ForegroundColor Green
} finally {
    Pop-Location
}

# 2. Prepare bundle directory
Write-Host "[2/4] Preparing bundle..." -ForegroundColor Yellow
if (Test-Path $BundleDir) {
    Remove-Item -Recurse -Force $BundleDir
}
New-Item -ItemType Directory -Path $BundleDir | Out-Null

# Copy build output
Copy-Item -Recurse (Join-Path $ProjectRoot "build") (Join-Path $BundleDir "build")
Write-Host "  build/ copied" -ForegroundColor Green

# Copy package files
Copy-Item (Join-Path $ProjectRoot "package.json") $BundleDir
Copy-Item (Join-Path $ProjectRoot "package-lock.json") $BundleDir
Write-Host "  package.json + package-lock.json copied" -ForegroundColor Green

# Copy deploy files
$DeployDir = Join-Path $ProjectRoot "deploy"
$DeployFiles = @(
    "install.sh",
    "seed.mjs",
    "reset-password.mjs",
    "reset-password.sh",
    "digimos.service",
    "digimos-nginx.conf",
    "digimos-apache.conf"
)
foreach ($file in $DeployFiles) {
    $src = Join-Path $DeployDir $file
    if (Test-Path $src) {
        Copy-Item $src $BundleDir
        Write-Host "  $file copied" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: $file not found" -ForegroundColor Red
    }
}

# Copy README
$readmeSrc = Join-Path $DeployDir "README.md"
if (Test-Path $readmeSrc) {
    Copy-Item $readmeSrc $BundleDir
    Write-Host "  README.md copied" -ForegroundColor Green
}

# 3. Create tar.gz
Write-Host "[3/4] Creating archive..." -ForegroundColor Yellow
if (Test-Path $OutputFile) {
    Remove-Item $OutputFile
}

Push-Location $ProjectRoot
try {
    & tar -czf "digimos-bundle.tar.gz" "digimos-bundle"
    if ($LASTEXITCODE -ne 0) { throw "tar failed" }
    Write-Host "  Archive created" -ForegroundColor Green
} finally {
    Pop-Location
}

# 4. Cleanup
Write-Host "[4/4] Cleanup..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $BundleDir
Write-Host "  Temp files removed" -ForegroundColor Green

# Summary
$size = (Get-Item $OutputFile).Length / 1MB
Write-Host ""
Write-Host "=== Bundle Ready ===" -ForegroundColor Green
Write-Host "  File: $OutputFile"
Write-Host ("  Size: {0:N1} MB" -f $size)
Write-Host ""
Write-Host "Cara deploy:" -ForegroundColor Cyan
Write-Host "  1. Copy digimos-bundle.tar.gz ke STB"
Write-Host "  2. tar -xzf digimos-bundle.tar.gz"
Write-Host "  3. cd digimos-bundle"
Write-Host "  4. sudo bash install.sh"
Write-Host ""
