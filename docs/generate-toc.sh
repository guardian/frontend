#!/bin/sh

echo "#Table Of Content"
echo ""
for dir in */; do
    echo "##[$dir]($dir)"
    cd $dir
    for doc in *.md; do
        if [ "$doc" != "README.md" ]; then
            echo "- [$doc]($dir$doc)"
        fi
    done
    cd ..
    echo ""
done
