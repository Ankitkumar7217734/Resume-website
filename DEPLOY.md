# 🚀 Deploy LaTeX Editor to Render.com

## Prerequisites

- GitHub account
- Render.com account (free)
- Your LaTeX Editor code pushed to GitHub

## Step-by-Step Deployment Guide

### 1️⃣ Prepare Your GitHub Repository

First, push your code to GitHub:

```bash
cd /Users/ankitkumar/Downloads/project/resume-webpage

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Render.com deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/latex-editor.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy on Render.com

1. **Sign up / Log in to Render.com**

   - Go to https://render.com
   - Sign up with GitHub (easiest option)

2. **Create New Web Service**

   - Click "New +" button
   - Select "Web Service"

3. **Connect Repository**

   - Connect your GitHub account
   - Find and select your `latex-editor` repository
   - Click "Connect"

4. **Configure Service**
   Fill in these settings:

   ```
   Name: latex-editor (or any name you want)
   Region: Choose closest to you
   Branch: main
   Root Directory: (leave blank)
   Environment: Node
   Build Command: bash ./build.sh
   Start Command: node server.js
   Plan: Free
   ```

5. **Advanced Settings** (Optional)

   - Auto-Deploy: Yes (recommended)
   - Environment Variables: None needed

6. **Click "Create Web Service"**

### 3️⃣ Wait for Deployment

Render will:

1. ✅ Clone your repository
2. ✅ Run `build.sh` (installs TeX Live, Pandoc, npm packages)
3. ✅ Start your server with `node server.js`

This takes **5-10 minutes** (first time is slow due to LaTeX installation)

### 4️⃣ Access Your Live Site

Once deployed, you'll get a URL like:

```
https://latex-editor-xxxx.onrender.com
```

🎉 Your LaTeX editor is now live!

---

## 🔧 Important Notes

### Free Tier Limitations

- **Sleeps after 15 minutes** of inactivity
- **Wakes up in ~30 seconds** when accessed
- **750 hours/month** free (enough for most personal use)
- Keep it active: Use cron-job.org to ping every 14 minutes (optional)

### Build Time

- **First deploy**: ~10 minutes (installs LaTeX)
- **Subsequent deploys**: ~2-3 minutes

### Troubleshooting

**Build fails?**

- Check Render logs for errors
- Ensure `build.sh` has execute permissions (`chmod +x build.sh`)
- LaTeX packages might timeout - try again

**App won't start?**

- Check that `PORT` environment variable is used in server.js ✅ (already configured)
- Check logs for errors

**LaTeX compilation fails?**

- TeX Live installation might be incomplete
- Check Render logs
- Try redeploying

---

## 📝 Files Created for Deployment

✅ `render.yaml` - Render configuration
✅ `build.sh` - Build script (installs LaTeX)
✅ Updated `server.js` - Uses PORT env variable
✅ Updated `app.js` - Smart API URL detection

---

## 🎯 Next Steps After Deployment

1. **Test compilation** with all templates
2. **Share your URL** with others
3. **Set up custom domain** (optional, free on Render)
4. **Monitor usage** in Render dashboard

---

## 💰 Cost Estimate

**Free Tier**: $0/month

- Perfect for personal use, portfolios, demos
- 750 hours/month free
- Unlimited bandwidth

**Paid Tier** (if you upgrade): ~$7/month

- No sleep
- More resources
- Priority support

---

## 🆘 Need Help?

Common issues and solutions:

**Issue**: Build timeout
**Solution**: Render may timeout on first build. Just redeploy.

**Issue**: LaTeX package missing
**Solution**: Add package to `build.sh`:

```bash
apt-get install -y texlive-YOUR-PACKAGE
```

**Issue**: Site is slow
**Solution**: Free tier sleeps. Upgrade or use cron ping.

---

## 🔄 Updates and Redeployment

When you push to GitHub:

1. Commit changes: `git add . && git commit -m "Update"`
2. Push: `git push`
3. Render auto-deploys (if enabled)

Or manually redeploy from Render dashboard.

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [TeX Live Packages](https://tug.org/texlive/)
- [Render Free Tier Details](https://render.com/pricing)

---

**Ready to deploy? Follow the steps above! 🚀**
