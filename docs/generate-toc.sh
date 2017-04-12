#!/bin/bash

cleanDirectoryName() {
    # Remove leading number 
    # Replace dash with space
    # Remove trailing '/'
    # trim spaces 
    dirname=$(echo "$1" \
    | sed 's/^[0-9]*//g' \
    | sed 's/-/ /g' \
    | sed 's/\/$//g' \
    | xargs)
    
    capitalize "$dirname"
}

cleanFileTitle() {
    # Get title 
    # Remove formatting markdown characters
    # Also trim spaces 
    head -n 1 "$1" | sed 's/[*#]//g' | xargs 
}

capitalize() {
    # Capitalize first letter
    head=$(echo "$1" | cut -c1 | tr [a-z] [A-Z])
    tail=$(echo "$1" | cut -c2-)
    echo "$head$tail"
}

root=$(git rev-parse --show-toplevel)
docs="$root/docs"
pushd $docs > /dev/null

echo "# Table Of Contents"
echo "*(Do NOT edit manually. Generated automatically)*"
echo ""
for dir in */; do
    dirname=$(cleanDirectoryName $dir)
    echo "## [$dirname]($dir)"
    cd $dir > /dev/null
    for doc in *.md; do
        if [ "$doc" != "README.md" ]; then
            filepath=$dir$doc
            title=$(cleanFileTitle $doc)
            echo "- [$title]($filepath)"
        fi
    done
    cd ..
    echo ""
done

echo ""
echo "---"
cat how-to-create-a-doc-file.md

popd > /dev/null
