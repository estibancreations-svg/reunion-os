# GitHub upload — exact steps

## A. Create the repository
1. Go to https://github.com/new
2. Name: **reunion-os** (already created)

## B. Push (if needed)
```bash
unzip reunion-os-github.zip
cd reunion-system
git init
git add .
git commit -m "Complete Reunion OS"
git branch -M main
git remote add origin https://github.com/estibancreations-svg/reunion-os.git
git push -u origin main
```

## C. Supabase + Vercel
See DEPLOY.md
