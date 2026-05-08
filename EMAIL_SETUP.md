# Email Notification Setup Guide

## 📧 Configure Gmail for Email Alerts

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **Mail** and **Windows Computer**
3. Click **Generate**
4. Copy the 16-character password

### Step 3: Update server.js
Open `server.js` and update lines 50-54:

```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'anuragkawade17@gmail.com',      // Your Gmail address
    pass: 'lfub ifhq jvgt djdd'         // Your app password
  }
});
```

Also update line 58:
```javascript
from: 'your-email@gmail.com',  // Your Gmail address
```

### Step 4: Install Nodemailer
```bash
npm install nodemailer
```

### Step 5: Restart Server
```bash
npm start
```

## 🔔 How It Works

1. **Trigger**: When a user's session ends with attention < 50%
2. **Cooldown**: Only sends email if last alert was > 2 hours ago
3. **Recipient**: Admin email (first user with role='admin')
4. **Content**: User details, attention score, duration, timestamp

## 📨 Email Format

**Subject:** ⚠️ Low Attention Alert - [Username]

**Body:**
- User: username (email)
- Attention Score: XX%
- Duration: XX minutes
- Time: [timestamp]
- Warning message

## 🧪 Test Email System

1. Login as a regular user
2. Start camera → Start recording
3. Record for 30+ seconds with low attention
4. Stop recording
5. Admin receives email (if > 2 hours since last alert)

## 🔧 Troubleshooting

**"Invalid login"**: Use app password, not regular password
**"Less secure app"**: Enable 2FA and use app password
**No email received**: Check spam folder, verify admin email exists

## 🔐 Security Notes

- Never commit credentials to Git
- Use environment variables in production:
  ```javascript
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS
  ```
