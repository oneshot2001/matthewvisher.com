#!/usr/bin/env bash
# Generate + deploy + verify + commit + push one NftF note. Usage: publish-note.sh <NN> "<kit dir>" [YYYY-MM-DD] [linkedin-url]
set -euo pipefail
NO=$1; KIT=$2; DATE=${3:-$(date +%F)}; LI=${4:-}
SITE="$(cd "$(dirname "$0")/.." && pwd)"; cd "$SITE"
NN=$(printf %02d "$NO")
python3 scripts/publish-note.py --no "$NO" --kit "$KIT" --date "$DATE" ${LI:+--linkedin "$LI"}
npx wrangler pages deploy . --project-name matthewvisher-com --branch master --commit-dirty=true 2>&1 | grep -E "Deployment complete" || { echo "DEPLOY FAILED"; exit 1; }
sleep 8
for u in "notes/no-$NN/" "notes/" ; do c=$(curl -s -o /dev/null -w '%{http_code}' -H 'Cache-Control: no-cache' "https://matthewvisher.com/$u"); echo "$c $u"; [ "$c" = 200 ] || { echo "VERIFY FAILED"; exit 1; }; done
curl -s "https://matthewvisher.com/notes/" | grep -q "Read NO. $NN" || { echo "index card not live"; exit 1; }
TITLE=$(sed -n '3p' "$KIT"/article-no-$NN*.txt | head -1)
git add notes sitemap.xml
git commit -q -m "notes: add NO. $NN ($TITLE); index card, series nav, sitemap

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin master 2>&1 | tail -1
git fetch -q origin; echo "local $(git rev-parse --short HEAD) origin $(git rev-parse --short origin/master)"
git log --oneline -1; git status --short | wc -l
