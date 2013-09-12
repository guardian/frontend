## Raising an issue

Here is a template for raising an issue, copy and paste it into the text field and fill it:

```
## Steps to reproduce



## Environment

Device: 
Browser: 
OS: 
URL: 
```

We welcome code submissions from other teams. Here's the rules of engagement.

## General 

- The philosophy here is about communication, taking responsibility for your changes, and fast, incremental delivery.
- Speak to the team before you decide to do anything major. We can probably help design the change to maximise it's chances of being accepted.
- We have three environments - DEV (your machine), CODE and PROD.
- Pull requests made to master assume the change is ready to be pushed in PROD (code, ux, design, qa).
- Many small requests will be reviewed/merged quicker than a giant lists of changes. Use a switch if you do not want the public to see what you are releasing (Eg, [here](https://github.com/guardian/frontend-admin/commit/28c6860ea11a43225c9bbd475131900c7955b6f7) and [here](https://github.com/guardian/frontend/commit/86bd496e47023e086e71f6ceb1596531c2186853)).

# Submission

### Guardian employees

This is applicable to [GMG employees](http://www.gmgplc.co.uk/).

- Understand what you are trying to achieve with the change (what does success look like?)
- Fork the code and make your changes.
- Test your branch locally by running unit and integration tests:
    - ./sbt012 project &lt;project> test
    - grunt test:integration:&lt;project>
- Open a pull request.
    - Explain why you are making this change in the pull request
    - Include information about how you plan to measure success (e.g. links to analytics reports)
    - If this change is not measurable be very clear about that fact.
- A member of the team will review the changes. Once they are satisfied they will add +1 to the pull request.
- If there are no broken or ongoing builds in Teamcity, merge your branch and then ensure the master branch is built successfully: both [builds](http://teamcity.gudev.gnl:8111/project.html?projectId=project35&tab=projectOverview) and [integration tests](http://teamcity.gudev.gnl:8111/project.html?projectId=project41&tab=projectOverview).
- Deploy the code yourself, first to CODE then to PROD.
- Pay close attention to our [monitoring](http://graphite.guprod.gnl/dashboard/dashboards-dev/gdn-frontend.php?time=1d&env=PROD).

### External contributions

Firstly, thanks for helping make our service better! Secondly, we'll try and make this as simple as possible.

- Fork the frontend project on GitHub, patch the code, and submit a pull request.
- We'll test, verify and merge your changes and then deploy the code.
- Certain contributions will require a Contributor License Agreement.

## The team is your conscience

Here's some wise words from [@gklopper](https://github.com/gklopper).

We only merge to master when the software is ready to go live. This will be different for each thing we do, it might be as simple as showing the person next to you that the typo has been fixed, or you might spend an afternoon with Chris, Nick, or Kay looking over your shoulder.

If in doubt ask the team, the team is your conscience.

When you merge your branch to master you need to check the builds go through and that the auto deploy happens to CODE. This is as simple as glancing at the [TeamCity](http://teamcity.gudev.gnl:8111/project.html?projectId=project35&tab=projectOverview) page and then hitting some URLs on CODE to ensure your software is doing what you expected it to do.

If there are problems on CODE then revert your changes from master, fix and try again. Don't leave broken things lying around for others to trip themselves up on.

You are nearly done, simply deploy to PROD (via *gu* tools) and again check that your software is doing what you expected. 

If it is a bit late in the day or it is nearly lunch and you do not want to deploy to PROD immediately then do not merge to master.

After a few days it's polite to report back to the team how the feature is being used by the audience.
