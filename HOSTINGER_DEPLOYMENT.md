# Hostinger Deployment Guide with GitHub Actions

This guide outlines how to host your website on Hostinger and set up **automated deployment** so that every time you push code to GitHub, your live website updates automatically.

## Prerequisites
- A **GitHub Repository** with your project code.
- A **Hostinger** Account with a hosting plan.
- Your project files (HTML/CSS/JS) ready for deployment.

---

## Step 1: Prepare Hostinger
1.  Log in to your **Hostinger hPanel**.
2.  Go to **Hosting** > **Manage** (for your domain).
3.  On the left sidebar, find **Files** > **FTP Accounts**.
4.  Note down the following details (you will need them later):
    *   **FTP Host / IP Address**: (e.g., `185.xxx.xxx.xxx`)
    *   **FTP Username**: (e.g., `u123456789`)
    *   **FTP Password**: (If you forgot it, you can reset it here).
    *   **Port**: Usually `21`.
5.  **Important**: Check your root directory. Usually, it is `/public_html`. If you want to deploy to a subfolder, note that path (e.g., `/public_html/myapp`).

---

## Step 2: Configure GitHub Secrets
To safely store your FTP credentials, we use GitHub Secrets.

1.  Go to your project's repository on **GitHub**.
2.  Click **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret**.
4.  Add the following secrets one by one:
    *   **Name**: `FTP_SERVER` | **Value**: Your Hostinger FTP IP Address.
    *   **Name**: `FTP_USERNAME` | **Value**: Your Hostinger FTP Username.
    *   **Name**: `FTP_PASSWORD` | **Value**: Your Hostinger FTP Password.

---

## Step 3: Create the GitHub Action
This script tells GitHub what to do when you push code.

1.  In your local project folder, create this directory path: `.github/workflows/`
2.  Inside that folder, create a file named `deploy.yml`.
3.  Paste the following code into `deploy.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches:
      - main  # Or 'master', depending on your default branch name

jobs:
  web-deploy:
    name: 🎉 Deploy
    runs-on: ubuntu-latest
    steps:
      - name: 🚚 Get latest code
        uses: actions/checkout@v4

      - name: 📂 Sync files
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          server-dir: /public_html/  # Change this if deploying to a subfolder
          exclude: |
            **/.git*
            **/.github*
            **/node_modules/**
            README.md
            *.md
```

## Step 4: Push and Deploy
1.  Save the `deploy.yml` file.
2.  Commit and push your changes to GitHub:
    ```bash
    git add .
    git commit -m "Setup automated deployment"
    git push origin main
    ```
3.  Go to the **Actions** tab in your GitHub repository.
4.  You should see a new workflow running named "Deploy to Hostinger".
5.  Wait for it to turn green (Success).

## Step 5: Verify
Visit your website URL. Your latest changes should now be live!

### Troubleshooting
*   **Deployment Failed?** Check the "Actions" tab logs on GitHub. 
*   **403 Forbidden / White Screen?** Ensure your `index.html` is inside `public_html`, not a subfolder inside it.
*   **Wrong Folder?** If your site appears at `domain.com/myproject`, check the `server-dir` setting in `deploy.yml`. It should typically be just `/public_html/` for the main domain.
