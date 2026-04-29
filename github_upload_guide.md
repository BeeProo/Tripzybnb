# 🚀 How to Upload Tripzybnb to GitHub

Follow these steps to upload your project to GitHub for the first time.

### 1. Create a Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name your repository `Tripzybnb`.
3. Keep it **Public** (or Private if you prefer).
4. **Do NOT** initialize with a README, license, or `.gitignore` (we already have them).
5. Click **Create repository**.

### 2. Initialize Git Locally
Open your terminal in the root folder (`Tripzybnb`) and run:

```bash
# Initialize a new git repository
git init

# Add all files to the staging area
git add .

# Create your first commit
git commit -m "Initial commit: Tripzybnb with Razorpay, Host Dashboard, and Notifications"
```

### 3. Connect and Push to GitHub
Copy the URL of the repository you just created (e.g., `https://github.com/yourusername/Tripzybnb.git`) and run:

```bash
# Rename branch to main (standard)
git branch -M main

# Link your local folder to GitHub
# (Replace the URL below with your actual repo URL)
git remote add origin https://github.com/yourusername/Tripzybnb.git

# Push your code to GitHub
git push -u origin main
```

---

### ⚠️ Important Notes
- **Sensitive Data**: I have updated your `.gitignore` to ensure your `.env` files and `node_modules` are **NOT** uploaded. This protects your database credentials and secrets.
- **Future Changes**: After you make more changes, you only need to run:
  ```bash
  git add .
  git commit -m "described your changes here"
  git push
  ```
