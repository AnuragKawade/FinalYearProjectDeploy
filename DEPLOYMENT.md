# 🚀 Vercel Deployment Guide

## Step-by-Step Deployment Process

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Prepare Project**
1. **Navigate to project directory:**
```bash
cd "c:\Final Year Project\Real-Time-Attention-Tracking-master"
```

2. **Install dependencies:**
```bash
npm install
```

3. **Test locally:**
```bash
npm start
```

### **Step 3: Initialize Git Repository**
```bash
git init
git add .
git commit -m "Initial commit - Real-Time Attention Tracking System"
```

### **Step 4: Deploy to Vercel**

#### **Option A: CLI Deployment**
```bash
vercel
```
Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name: **attention-tracking** (or your choice)
- Directory: **.** (current directory)

#### **Option B: GitHub + Vercel Dashboard**
1. **Push to GitHub:**
```bash
git remote add origin https://github.com/yourusername/attention-tracking.git
git branch -M main
git push -u origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub
   - Select your repository

### **Step 5: Configure Environment Variables**

In Vercel Dashboard → Project → Settings → Environment Variables:

```
MONGODB_URI = mongodb+srv://anuragkawade17_db_user:CvF5MgmAA5JZPJUd@cluster0.0zzftls.mongodb.net/attention_tracker?retryWrites=true&w=majority

JWT_SECRET = your-super-secure-random-string-change-this

EMAIL_USER = anuragkawade17@gmail.com

EMAIL_PASS = lfubifhqjvgtdjdd

NODE_ENV = production

CORS_ORIGIN = https://your-app-name.vercel.app
```

### **Step 6: Update Frontend Configuration**

Update `config.js` with your Vercel domain:
```javascript
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000'
  },
  production: {
    baseURL: 'https://your-app-name.vercel.app'
  }
};
```

### **Step 7: Test Deployment**

1. **Visit your deployed app:**
   - URL: `https://your-app-name.vercel.app`

2. **Test key features:**
   - Registration: `/register.html`
   - Login: `/login.html`
   - Create admin: `/api/create-admin`
   - Main app: `/index.html`

### **Step 8: Configure Custom Domain (Optional)**

In Vercel Dashboard → Project → Settings → Domains:
1. Add your custom domain
2. Configure DNS records as instructed
3. Update CORS_ORIGIN environment variable

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. API Routes Not Working**
- Check `vercel.json` configuration
- Ensure all API calls use relative URLs in production

#### **2. MongoDB Connection Issues**
- Verify MONGODB_URI environment variable
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Vercel)

#### **3. CORS Errors**
- Update CORS_ORIGIN environment variable
- Check corsOptions in server.js

#### **4. Build Failures**
- Check Node.js version compatibility
- Verify all dependencies in package.json

### **Debug Commands:**
```bash
# Check deployment logs
vercel logs

# Redeploy
vercel --prod

# Check environment variables
vercel env ls
```

## 📁 **File Structure for Deployment**

```
Real-Time-Attention-Tracking-master/
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies and scripts
├── server.js           # Main server file
├── config.js           # Frontend API configuration
├── .env.example        # Environment variables template
├── index.html          # Main application
├── login.html          # Login page
├── register.html       # Registration page
├── org-admin.html      # Organization admin dashboard
├── auth.js            # Authentication functions
├── app.js             # Main application logic
├── style.css          # Styles
└── README.md          # Project documentation
```

## 🌐 **Production URLs**

After deployment, your app will be available at:
- **Main App:** `https://your-app-name.vercel.app/`
- **Login:** `https://your-app-name.vercel.app/login.html`
- **Register:** `https://your-app-name.vercel.app/register.html`
- **Admin Setup:** `https://your-app-name.vercel.app/api/create-admin`
- **Org Admin:** `https://your-app-name.vercel.app/org-admin.html`

## 🔐 **Security Checklist**

- ✅ Environment variables configured
- ✅ JWT secret is secure and random
- ✅ MongoDB IP whitelist configured
- ✅ CORS origins properly set
- ✅ No hardcoded credentials in code
- ✅ HTTPS enabled (automatic with Vercel)

## 📊 **Post-Deployment Testing**

1. **Create admin accounts:** Visit `/api/create-admin`
2. **Register test users:** Use different email domains
3. **Test organizational isolation:** Login as different roles
4. **Verify attention tracking:** Test camera functionality
5. **Check data persistence:** Ensure MongoDB connection works

## 🚀 **Continuous Deployment**

Once connected to GitHub:
1. Push changes to main branch
2. Vercel automatically deploys
3. Check deployment status in dashboard
4. Test new features in production

Your Real-Time Attention Tracking System is now live and accessible worldwide! 🎉