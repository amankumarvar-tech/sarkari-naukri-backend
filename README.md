# SarkariNaukri.in – Full Stack Setup

## Folder Structure
```
sarkari-naukri/
├── server.js          ← Node.js Backend
├── package.json
├── data/
│   ├── jobs.json
│   ├── admitcards.json
│   ├── results.json
│   └── answerkeys.json
└── public/
    ├── index.html     ← Main Website
    ├── job-detail.html
    └── admin.html     ← Admin Panel
```

## Setup (VS Code Terminal)

```bash
# 1. Is folder mein jao
cd sarkari-naukri

# 2. Dependencies install karo
npm install

# 3. Server start karo
npm start
```

## URLs
- 🌐 Website:     http://localhost:3000
- 🔧 Admin Panel: http://localhost:3000/admin

## Environment Variables
- `ADMIN_USER` = admin
- `ADMIN_PASS` = sarkari123
- `PORT` = 3000

Set these before deploy for Railway/Render or production use.

## Admin Panel Features
- ✅ Jobs Add / Edit / Delete
- ✅ Admit Cards Manage
- ✅ Results Manage  
- ✅ Answer Keys Manage

## Naya Job Add Karne Ka Tariqa
1. http://localhost:3000/admin kholo
2. "📋 Sarkari Jobs" pe click karo
3. "+ Naya Job Add Karo" button dabao
4. Form bharo aur Save karo
5. Website pe turant dikhai dega!
