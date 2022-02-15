
git add --all
git commit -m "update"

call npm version minor

git add --all
git commit -m "update version"

git push --all --prune

call npm publish

