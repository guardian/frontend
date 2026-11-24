## The Interactive Librarian

London, August 2021.

The Interactive Librarian was introduced in July 2021 as part of the migration of interactives HTML rendering from frontend to Dotcom Rendering (DCR). (It is named after the Forerunner Librarian that appeared in Halo 4.)

### Context: the Interactives DCR migration

When DCR was acquiring the ability to render interactives, it was decided that the initial implementation would work as follows:

1. Any interactive published before a given date, switch date, would be rendered by frontend.
2. Interactives published after that date would be sent to DCR for rendering (unless wearing a opt-out tag).

The above was a temporary implementation and the follow up would be either (or an hybrid mix of):

-   DCR acquires the ability to render all past interactives (where "past" means before the switch date) leading to all interactives being sent to DCR

-   Past interactives would be pressed and stored into S3 and served to the user from there. The motivation for this was the desire to eventually decommission Interactives rendering code from frontend itself and use pressed contents.

### Populating S3

The population of aws S3 with interactive content was performed on all past interactives, regardless of whether or not the pressed data would ever be needed or not.

In fact, at the time these lines are written, the "ideal" for us is DCR being able to render all past interactives eventually, in which case the Librarian will be removed from frontend since it would then not be used.

### Notes

A. Since a route was introduced for capturing the live content and another one was introduced for the "cleaning" (meaning reading from **aws-frontend-archives-original**, cleaning and writing to **aws-frontend-archive**), the reader could wonder where the code that actually performed those batch operations is. Answer: it is not part of the scala code. Pascal wrote a Ruby script to perform them. For the first run (batch storing to **aws-frontend-archives-original**, see documentation folder **02-Batch-01**). Both routes have now been deleted (see https://github.com/guardian/frontend/pull/29371/)

B. The batch "cleaning" was done using the scripts in documentation folder **03-Batch-02**.

C. Note that the scripts given **02-Batch-01** and **03-Batch-02**, are not portable. They are included to the documentaion for historical interest. The important thing is that the Dotcom team knows what the two [admin] routes are for.

D. One question that was left out from the above discussion is "How did you find the Interactive URLs ?", alternatively "How did you build [03.interactive-urls.txt](./02-Batch-01/03.interactive-urls.txt) ?" That list is the outcome of calling CAPI. This is done by the script **01-interactive-urls**.

### The Future of the Librarian

Ideally, one day, we will find a way for DCR to render past interactives and get rid of the Librarian. (This might not happen actually...)
