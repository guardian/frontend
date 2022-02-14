# **The different applications composing the Guardian website**

The Guardian frontend is a set of Play Framework 2 Scala applications.

A Nginx **router** sits in front of all the applications and dispatches requests to the appropriate service based on the requested path.

_[Nginx router config file (Private)](https://github.com/guardian/platform/blob/master/router/files/router.conf)_


# Facia
Facia app is responsible for serving Front pages.

Examples:

- [https://www.theguardian.com/uk]()

- [https://www.theguardian.com/politics]()

- [https://www.theguardian.com/uk/culture]()

[All supported routes](https://github.com/guardian/frontend/blob/main/facia/conf/routes)

[Architectural diagram](02-fronts-architecture.md)

# Article
Article app serves all Guardian [articles](https://www.theguardian.com/world/2016/jul/18/european-leaders-urge-turkey-to-respect-rule-of-law-after-failed-coup), [live blogs](https://www.theguardian.com/sport/live/2016/jul/18/county-cricket-hampshire-v-surrey-and-more-live) or minute emails.

[All supported routes](https://github.com/guardian/frontend/blob/main/article/conf/routes)

# Applications
Applications app is responsible to serve:

- Galleries

- Image content (cartoon, graphic, ...)

- Audio and video pages

- Interactives

- Short urls

- Crosswords and Sudoku

- Index pages

- Email signup pages

- Opt-in/out endpoint

- Quizz submitting

- ...

[All supported routes](https://github.com/guardian/frontend/blob/main/applications/conf/routes)

# Onward
Onward app serves related content like:

- Most read

- Top stories

- Popular content

- Series content

[All supported routes](https://github.com/guardian/frontend/blob/main/onward/conf/routes)

# Discussion
Discussion app is responsible to serve all content related to article comments:

- Comments count

- Discussion thread and individual comment

- Report abuse

[All supported routes](https://github.com/guardian/frontend/blob/main/discussion/conf/routes)

# Commercial
Commercial app serves all commercial components (Travel offers, Masterclasses, Money, Book, Live events or Hosted content).

[All supported routes](https://github.com/guardian/frontend/blob/main/commercial/conf/routes)

# Facia-Press
Facia-press's only task is to press fronts.
_Pressing a front means creating a json representation of the front content and storing it in a S3 bucket for further use by the Facia app._

Since a front page is made up of one or more pieces of content, to render a page efficiently the system reads the cached output of Facia-press to drastically improve the render time of Facia. Without Facia-Press, the Facia server would have to lookup many content IDs from Content API, causing a large amount of work to be done on Facia itself, giving the server group poor performance under load, and breaking the golden response time rule (respond in under 2000ms).

Pressing happens automatically as the Facia-Press app listens to a job queue and responds to pressing requests as they occurs.

Pressing tasks are also scheduled via a cron job to be triggered on a regular basis.

It is also possible to run a pressing task by manually sending a request to one of the supported endpoints.

[All supported routes](https://github.com/guardian/frontend/blob/main/facia-press/conf/routes)

[Architectural diagram](02-fronts-architecture.md)

# Identity
Identity app is responsible for all account related endpoints (sign-in, register, account edit, email prefs, saved for later).

Parts of Identity, including sign-in and registration are now served by a separate stack in: [identity-frontend](https://github.com/guardian/identity-frontend). Old sign-in and registration pages are still within this repo, to be deprecated.

[All supported routes](https://github.com/guardian/frontend/blob/main/identity/conf/routes)

# Sport
Sport app serves match results, league tables, upcoming matches, teams and competitions for Football, Cricket and Rugby.

[All supported routes](https://github.com/guardian/frontend/blob/main/sport/conf/routes)


# Rss
Rss app is rendering the RSS version for all Guardian content.

[All supported routes](https://github.com/guardian/frontend/blob/main/rss/conf/routes)

# Admin
Admin app hosts a set of dashboards and tools used by Guardian developers to monitor, manage and troubleshoot the Guardian website.

[All supported routes](https://github.com/guardian/frontend/blob/main/admin/conf/routes)

# Archive
In case none of the other apps can serve a given request, it is finally passed to the Archive app which checks if there is any redirect setup for this url or any old static content attached to it.

If yes the Archive app returns this old static content or redirect, otherwise a 404 is eventually served to the client.

[All supported routes](https://github.com/guardian/frontend/blob/main/archive/conf/routes)

# Diagnostics
Diagnostics app is used internally to gather data and analytics from the Guardian frontend client side.

[All supported routes](https://github.com/guardian/frontend/blob/main/diagnostics/conf/routes)

# Preview
Preview is a standalone version of the guardian website (ie: an aggregation of all the other apps) used in the editorial tool to preview draft article before they are live.
It allows us to have a fully functional version of the website without the overhead of maintaining an entire new stack.

[All supported routes](https://github.com/guardian/frontend/blob/main/preview/conf/routes)
