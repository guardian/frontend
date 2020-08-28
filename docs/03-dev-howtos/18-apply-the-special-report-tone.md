# Apply the special report tone

The Special Report tone can be added by central production by adding the required tag to the Special Tag Test Campaign in the Targeting Tool.

## DEPRECATED 

*The following method is deprecated and replaced with the targeting tool method, but kept here for prosperity as existing tags still use the method.*

Sometimes CP or someone from Editorial will ask us to apply the special report treatment to a tag.
The following doc explains how to make that happen.

1. Find out the id of the tag where we need the special report tone. For example "news/series/panama-papers".
2. Replace <NEW-SPECIAL-TAG> with the id of the special tag and run this code on a python REPL:
```
import hashlib
tag = "<NEW-SPECIAL-TAG>"
m = hashlib.md5()
m.update("a-public-salt3W#ywHav!p+?r+W2$E6="+tag)
print m.hexdigest()
```
3. Add the generated hash to the facia-scala-client on this file and raise a PR against master
https://github.com/guardian/facia-scala-client/blame/48f90b6173c6409507a58e8046868f0d9e93ca06/fapi-client/src/main/scala/com/gu/facia/api/utils/CardStyle.scala#L52

5. Merge the PR and release the library to Maven using sbt.

6. Update facia-scala-client library on Frontend and MAPI. Merge and deploy the PRs.
On Frontend - https://github.com/guardian/frontend/pull/15842/commits/3c6a598a0340fc9f4bd4e774d1466a5806f67c67
On MAPI - https://github.com/guardian/mobile-apps-api/pull/900/commits/99012625a0b9e4bbab61d224768ca31bf36fcf46

7. Profit! This will make Frontend and MAPI give this tone tag the special report treatment
