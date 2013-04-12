We welcome code submissions from other teams. Here's the rules of engagement.

## General 

- The philosophy here is about communication, taking responsibility for your changes, and fast, incremental delivery. If someone is asking why such and such found it's way in to the product then you are [Doing It Wrong](http://bookalicio.us/wp-content/uploads/2011/06/doing-it-wrong.jpg).
- Speak to the team before you decide to do anything major. We can probably help design the change to maximise it's chances of being accepted.
- We have three environments - DEV (your machine), CODE and PROD.
- Pull requests made to master assume the change is ready to be pushed in PROD.
- Many small requests will be reviewed/merged quicker than a giant lists of changes. Use a switch if you do not want the public to see what you are releasing.

## Submission

- Ensure your branch is built succesfully by TeamCity.
- Open a pull request.
- A member of the team will review the changes. Once they are satisfied they will add +1 to the pull request.
- Deploy the code yourself, first to CODE then to PROD.
- Pay close attention to the [monitoring](http://graphite.guprod.gnl/dashboard/dashboards-dev/gdn-frontend.php?time=1d&env=PROD).

## The team is your conscience

Here's some wise words from @gklopper.

We only merge to master when the software is ready to go live. This will be different for each thing we do, it might be as simple as showing the person next to you that the typo has been fixed, or you might spend an afternoon with Chris, Nick, or Kay looking over your shoulder.

If in doubt ask the team, the team is your conscience.

When you merge your branch to master you need to check the builds go through and that the auto deploy happens to CODE. This is as simple as glancing at the [TeamCity](http://teamcity.gudev.gnl:8111/project.html?projectId=project35&tab=projectOverview) page and then hitting some URLs on CODE to ensure your software is doing what you expected it to do. If there are problems on CODE then revert your changes from master, fix and try again.

You are nearly done, simply deploy to PROD (via *gu* tools) and again check that your software is doing what you expected. If it is a bit late in the day or it is nearly lunch and you do not want to deploy to PROD immediately then do not merge to master.

