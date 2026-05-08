# 📊 How to View Data in MongoDB Atlas

## Access Your Database

### 1. Login to MongoDB Atlas
- Go to https://cloud.mongodb.com/
- Login with your credentials

### 2. Navigate to Your Cluster
- Click on "Database" in the left sidebar
- Click "Browse Collections" on your Cluster0

### 3. View Your Data

#### Database Structure:
```
attention_tracker (Database)
├── users (Collection)
│   └── Documents with user data
└── sessions (Collection)
    └── Documents with session data
```

## 📁 Collections Explained

### **users** Collection
Stores registered user accounts:
```json
{
  "_id": "ObjectId",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "$2a$10$hashed_password...",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### **sessions** Collection
Stores attention tracking sessions:
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (reference to users)",
  "startTime": "2024-01-15T14:00:00.000Z",
  "endTime": "2024-01-15T15:30:00.000Z",
  "duration": 5400,
  "averageAttention": 78.5,
  "dataPoints": 1620,
  "sessionData": [
    {
      "timestamp": 1705327200000,
      "leftEAR": 0.285,
      "rightEAR": 0.290,
      "averageEAR": 0.2875,
      "headPose": {
        "yaw": 5.2,
        "pitch": -2.1,
        "roll": 0.8
      },
      "gazeDirection": "center",
      "attentionScore": 85.3
    }
    // ... more data points
  ]
}
```

## 🔍 How to Query Data in Atlas

### View All Users
1. Click on "users" collection
2. See all registered users
3. Click any document to expand and view details

### View All Sessions
1. Click on "sessions" collection
2. See all tracking sessions
3. Click to expand and see detailed session data

### Filter Data
Use the filter bar at the top:

**Find sessions by user:**
```json
{ "userId": ObjectId("your_user_id_here") }
```

**Find recent sessions:**
```json
{ "startTime": { "$gte": ISODate("2024-01-01") } }
```

**Find high attention sessions:**
```json
{ "averageAttention": { "$gte": 80 } }
```

## 📈 Useful Queries

### Count total users:
```javascript
db.users.countDocuments()
```

### Find user by email:
```json
{ "email": "john@example.com" }
```

### Get sessions with low attention:
```json
{ "averageAttention": { "$lt": 50 } }
```

### Sort sessions by date:
Click "Sort" button and use:
```json
{ "startTime": -1 }
```

## 🛠️ Atlas Features

### Charts
- Click "Charts" to create visualizations
- Create graphs of attention trends
- Monitor user activity

### Aggregations
Use aggregation pipeline for complex queries:
```javascript
[
  { $match: { averageAttention: { $gte: 70 } } },
  { $group: { _id: "$userId", avgAttention: { $avg: "$averageAttention" } } }
]
```

### Export Data
- Click "Export Collection" to download as JSON/CSV
- Useful for backup or analysis

## 🔐 Security Settings

### Network Access
- Go to "Network Access" in left sidebar
- Add your IP address to whitelist
- Or allow access from anywhere (0.0.0.0/0) for development

### Database Users
- Go to "Database Access"
- Manage user permissions
- Create read-only users for viewing data

## 📱 MongoDB Compass (Desktop App)

For better data visualization:
1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Connect using your connection string:
   ```
   mongodb+srv://anuragkawade17_db_user:CvF5MgmAA5JZPJUd@cluster0.0zzftls.mongodb.net/attention_tracker
   ```
3. Browse collections with a GUI interface
4. Run queries visually
5. Export/import data easily

## 🎯 Quick Tips

✅ **Real-time Updates**: Refresh the page to see new data
✅ **Document Limit**: Atlas shows 20 documents per page by default
✅ **Search**: Use the search bar to find specific documents
✅ **Indexes**: Create indexes on frequently queried fields for better performance
✅ **Backup**: Enable automated backups in cluster settings

## 📊 Sample Queries to Try

1. **Total sessions per user:**
   - Go to Aggregation tab
   - Add stage: `{ $group: { _id: "$userId", count: { $sum: 1 } } }`

2. **Average attention across all sessions:**
   - Add stage: `{ $group: { _id: null, avgAttention: { $avg: "$averageAttention" } } }`

3. **Sessions longer than 1 hour:**
   - Filter: `{ "duration": { "$gte": 3600 } }`

Your data is now stored in the cloud and accessible from anywhere! 🌐
