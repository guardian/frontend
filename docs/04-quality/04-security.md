# Security

[General security advice can be found in the `guardian/recommendations` repo](https://github.com/guardian/recommendations/blob/master/security.md)
## Snyk Code Scanning
There's a Github action set up on the repository to scan for vulnerabilities. This is set to "continue on error" and so will show a green tick regardless. In order to check the vulnerabilities we can use the Github code scanning feature in the security tab and this will list all vulnerabilities for a given branch etc. You should use this if adding/removing/updating packages to see if there are any vulnerabilities.
