@echo off
title Resellara Backend (Spring Boot + MySQL)
echo ===================================================
echo Starting Resellara Backend with Persistent MySQL...
echo ===================================================

cd /d "%~dp0backend"

:: Load DB credentials from User Registry if not in current environment
if "%DB_USERNAME%"=="" (
    for /f "tokens=2*" %%a in ('reg query HKCU\Environment /v DB_USERNAME 2^>nul') do set "DB_USERNAME=%%b"
)
if "%DB_USERNAME%"=="" set DB_USERNAME=sellara_user

if "%DB_PASSWORD%"=="" (
    for /f "tokens=2*" %%a in ('reg query HKCU\Environment /v DB_PASSWORD 2^>nul') do set "DB_PASSWORD=%%b"
)

echo Connecting to MySQL as user: %DB_USERNAME%
echo Database: sellara_db on localhost:3306
echo Server Port: 8080
echo ===================================================
echo.

call mvnw.cmd spring-boot:run
pause
