
git add --all
git commit -m "update"

call npm version minor

git push --all --prune

call npm publish

