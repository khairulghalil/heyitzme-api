## To remove all latest commit

git reset --hard lastcommittokeep

## To rebranch to a new repository

rm -rf .git
git remote -v
git remote remove origin

## To ignore local changes

git update-index --assume-unchanged config/config.js
git update-index --no-assume-unchanged config/config.js

# To initialize git

git init
git remote add origin https://github.com/khairulghalil/heyitzme-api.git
git branch -M main
git add .
git commit -m "first commit"
git push -u origin main

# Node version

nvm install 22
nvm use 22

# To deploy to Cloudflare Worker

npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SECRET_KEY
npx wrangler deploy
