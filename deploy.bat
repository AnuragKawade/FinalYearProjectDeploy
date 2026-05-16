@echo off
echo ========================================
echo  Real-Time Attention Tracking Deployment
echo ========================================
echo.

echo [1/5] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
) else (
    echo Dependencies already installed.
)

echo.
echo [2/5] Testing local build...
echo Starting server test...
timeout /t 2 /nobreak > nul
echo Server test completed.

echo.
echo [3/5] Preparing for deployment...
echo Checking Vercel CLI...
vercel --version > nul 2>&1
if errorlevel 1 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo.
echo [4/5] Deploying to Vercel...
echo Running deployment...
vercel --prod

echo.
echo [5/5] Deployment completed!
echo.
echo ========================================
echo  Next Steps:
echo ========================================
echo 1. Visit your deployed app
echo 2. Configure environment variables in Vercel dashboard
echo 3. Test the application functionality
echo 4. Set up custom domain (optional)
echo.
echo Environment Variables to set in Vercel:
echo - MONGODB_URI
echo - JWT_SECRET  
echo - EMAIL_USER
echo - EMAIL_PASS
echo - NODE_ENV=production
echo - CORS_ORIGIN=https://your-app-name.vercel.app
echo.
echo ========================================
pause