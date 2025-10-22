@echo off
REM PWA Development Server Script for Windows
REM This script helps with PWA development and testing

echo 🚀 Starting PWA Development Server...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Build the project first
echo 📦 Building project...
bun run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Start the preview server
    echo 🌐 Starting preview server on http://localhost:4173
    echo 📱 PWA Update Helper available at: http://localhost:4173/pwa-update.html
    echo.
    echo 💡 Tips for PWA testing:
    echo    • Open Chrome DevTools ^> Application ^> Service Workers
    echo    • Use the PWA Update Helper page to force updates
    echo    • Check 'Update on reload' in DevTools for faster testing
    echo.
    
    REM Start the preview server
    bun run preview
) else (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)
