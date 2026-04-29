# 🛠️ Guide to Source Control (Git)

Source Control (or Version Control) is like a "Save Game" system for your code. It tracks every change you make, allowing you to revert to previous versions or work on different features without breaking the main app.

## 1. The Core Workflow
There are three main steps to "saving" your work in Git:

1.  **Stage (Add)**: Picking which files you want to save.
2.  **Commit**: Creating the "Save Point" with a message describing what you did.
3.  **Push**: Sending those save points to GitHub.

---

## 2. Using Source Control in VS Code (Recommended)
You don't always need to type commands! VS Code has a built-in "Source Control" tab (the icon looks like a fork/branch).

1.  **Open the Tab**: Click the **Source Control** icon on the left sidebar (shortcut: `Ctrl + Shift + G`).
2.  **Stage Changes**: Click the **+** (plus) icon next to "Changes" or specific files to move them to **Staged Changes**.
3.  **Commit**: Type a message in the box (e.g., *"Added notification bell"*) and click the **Commit** button.
4.  **Sync/Push**: Click the **Sync Changes** button at the bottom to send your commits to GitHub.

---

## 3. Essential Git Commands (Terminal)
If you prefer the terminal, these are the only commands you'll use 90% of the time:

### Save your work
```bash
git add .                  # Stage all changes
git commit -m "your msg"   # Commit with a message
git push                   # Push to GitHub
```

### Get updates
If you are working from a different computer:
```bash
git pull                   # Download latest changes from GitHub
```

### Check status
```bash
git status                 # See what files are changed or staged
git log --oneline          # See a quick list of your previous "save points"
```

---

## 4. Why use it?
-   **No More `final_v2_really_final.zip`**: You have a clean history of every version.
-   **Safe Experimentation**: You can create a "Branch" to try something new. If it breaks, you just delete the branch and your main code is safe.
-   **Collaboration**: Multiple people can work on the same code without overwriting each other.

---

## 💡 Pro Tip
**Commit Often, Commit Small.**
Instead of working for 5 hours and making one giant commit, make a commit every time you finish a small task (e.g., "Fixed login button alignment"). This makes it much easier to fix things if something goes wrong later!
