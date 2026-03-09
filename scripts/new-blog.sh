#!/bin/bash
# Usage: ./scripts/new-blog.sh
# Creates the next numbered blog file from blog-template.html

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BLOGS_DIR="$SCRIPT_DIR/../blogs"
TEMPLATE="$BLOGS_DIR/blog-template.html"

if [ ! -f "$TEMPLATE" ]; then
  echo "Error: template not found at $TEMPLATE"
  exit 1
fi

# Find the highest existing blog number
LAST=$(ls "$BLOGS_DIR"/blog-[0-9]*.html 2>/dev/null \
  | grep -oE 'blog-[0-9]+\.html' \
  | grep -oE '[0-9]+' \
  | sort -n \
  | tail -1)

NEXT=$((LAST + 1))
OUTPUT="$BLOGS_DIR/blog-${NEXT}.html"

cp "$TEMPLATE" "$OUTPUT"

# Patch the image placeholder to the correct blog number
sed -i '' "s/blog-N\.jpeg/blog-${NEXT}.jpeg/g" "$OUTPUT"

echo ""
echo "Created: blogs/blog-${NEXT}.html"
echo ""
echo "Checklist:"
echo "  [ ] Add image:       img/blog/blog-${NEXT}.jpeg"
echo "  [ ] Update <title>   (replace BLOG_TITLE)"
echo "  [ ] Update .blog-title"
echo "  [ ] Update date      (replace DATE HERE)"
echo "  [ ] Update .category (replace CATEGORY + badge color if needed)"
echo "  [ ] Update .sub-title"
echo "  [ ] Write content    (inside the <section> block)"
echo ""
echo "  ⚠️  Remember to bump maxBlogNumber in assets/js/blog.js to ${NEXT}"
echo ""
