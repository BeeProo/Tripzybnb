# 🛠️ How to Use the Source Control Tab in VS Code

The **Source Control** tab (the icon with three circles and lines) is the easiest way to manage your code changes without using the terminal.

### 1. Initializing (If not already done)
If you see a button that says **"Initialize Repository"**, click it. This starts tracking your `Tripzybnb` project with Git.

### 2. Staging Changes (The "+" Button)
When you change a file, it appears under the **"Changes"** list.
- **Stage individual files**: Hover over a file and click the **`+`** icon.
- **Stage all files**: Click the **`+`** icon next to the **"Changes"** header.
- *Staged files move to the "Staged Changes" section.*

### 3. Committing (The Checkmark)
1. In the **"Message"** box at the top, type what you did (e.g., `added notifications and updated readme`).
2. Click the **"Commit"** button (or the ✅ checkmark icon).
3. This "saves" a snapshot of your code locally.

### 4. Publishing / Pushing
- **Publish Branch**: If it's your first time, you'll see a blue **"Publish Branch"** button. This will ask you to upload to GitHub.
- **Sync Changes**: After the first upload, the button will change to **"Sync Changes"** (with a circular arrow). Clicking this "pushes" your local saves to the GitHub website.

### 5. Viewing Diffs
If you click on any file in the list, VS Code will show you a **Split View**:
- **Left side**: How the code was before.
- **Right side**: The changes you just made (highlighted in green/red).

---

### 💡 Pro Tip
If you want to **undo** changes to a file before committing, hover over the file and click the **Discard Changes** icon (the counter-clockwise arrow `↩`). Be careful—this permanently deletes your unsaved edits!
