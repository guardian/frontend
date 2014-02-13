#!/bin/bash

V=$1

if [ -z "$V" ]
then
	echo -n "New version: "
	read V
fi

sed -i -e 's/"version": ".*"/"version": "'$V'"/' bower.json package.json
git commit -a -m "Bump version to $V"
git tag $V

git show $V

echo "Press ENTER to git push new version, or CTRL-C to abort"
read
git push origin master $V
