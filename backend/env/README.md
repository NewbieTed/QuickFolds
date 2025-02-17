# Environment Variables Folder

This folder is designated for storing environment variable files, which contain important configuration settings and credentials required for the application to function properly.

## ⚠️ Security Warning

Since environment files often include **sensitive credentials** such as database passwords, API keys, and other secret configurations, **they must never be pushed to Git**.

### **How to Ensure Security**
1. **Add this folder to `.gitignore`**  
   Ensure that `.gitignore` includes an entry like:
   ```/backend/env/*```
   ```!/backend/env/README.md```

   This prevents Git from tracking files in this folder while keeping this file updated.

2. **Use a `.env.example` File**  
   Instead of committing actual environment files, create a **`example.env`** file with placeholder values:
```ini
DATABASE_URL=your_database_url_here
DB_PASSWORD=your_db_password_here