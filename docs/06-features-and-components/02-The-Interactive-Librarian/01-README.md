## The Interactive Librarian

London, August 2021.

The Interactive Librarian was introduced in July 2021 as part of the migration of interactives HTML rendering from frontend to Dotcom Rendering (DCR). (It is named after the Forerunner Librarian that appeared in Halo 4.)

### Context: the Interactives DCR migration

When DCR was acquiring the ability to render interactives, it was decided that the initial implementation would work as follows:

1. Any interactive published before a given date, switch date, would be rendered by frontend.
2. Interactives published after that date would be sent to DCR for rendering (unless wearing a opt-out tag).

The above was a temporary implementation and the follow up would be either (or an hybrid mix of):

- DCR acquires the ability to render all past interactives (where "past" means before the switch date) leading to all interactives being sent to DCR

- Past interactives would be pressed and stored into S3 and served to the user from there. The motivation for this was the desire to eventually decommission Interactives rendering code from frontend itself and use pressed contents.

### Populating S3

The population of aws S3 with interactive content was performed on all past interactives, regardless of whether or not the pressed data would ever be needed or not.

In fact, at the time these lines are written, the "ideal" for us is DCR being able to render all past interactives eventually, in which case the Librarian will be removed from frontend since it would then not be used.

In order to perform te migration, Pascal introduced two [admin] routes

```
# Interactive Pressing
POST /interactive-librarian/live-presser/*path
POST /interactive-librarian/read-clean-write/*path
```

The reason why those were added to the [admin] app instead of, say, [applications], (where Pascal would have found more natural to add them) is because the [admin] app is the only app that has write access to S3.

### live-presser

The first route

```
POST /interactive-librarian/live-presser/*path
```

calls `InteractiveLibrarian.pressLiveContents`, triggers the retrieval of a live document and stores it to S3 in the **aws-frontend-archives-original** bucket

For instance, given document path

```
/books/ng-interactive/2021/mar/05/this-months-best-paperbacks-michelle-obama-jan-morris-and-more
```

The corresponding end points are


LOCAL: http://localhost:9000/interactive-librarian/live-presser/books/ng-interactive/2021/mar/05/this-months-best-paperbacks-michelle-obama-jan-morris-and-more

CODE:  https://m.code.dev-theguardian.com/interactive-librarian/live-presser/books/ng-interactive/2021/mar/05/this-months-best-paperbacks-michelle-obama-jan-morris-and-more

PROD: https://frontend.gutools.co.uk/interactive-librarian/live-presser/books/ng-interactive/2021/mar/05/this-months-best-paperbacks-michelle-obama-jan-morris-and-more

Which you call with

```
curl -X POST "https://frontend.gutools.co.uk/interactive-librarian/live-presser/books/ng-interactive/2021/mar/05/this-months-best-paperbacks-michelle-obama-jan-morris-and-more"
```

### read-clean-write

The second route

```
POST /interactive-librarian/read-clean-write/*path
```

performs the read of a previously stored document, its "cleaning" and stores the outcome to bucket **aws-frontend-archive**.

### Notes

A. In order for the two [admin] routes

```
# Interactive Pressing
POST /interactive-librarian/live-presser/*path
POST /interactive-librarian/read-clean-write/*path
```

to work, the **content-presser** switch must be ON. Because calling those routes is not part of "normal operations" for frontend, the switch should be OFF, unless otherwise specified. It never expires.

B. Since a route was introduced for capturing the live content and another one was introduced for the "cleaning" (meaning reading from **aws-frontend-archives-original**, cleaning and writing to **aws-frontend-archive**), the reader could wonder where the code that actually performed those batch operations is. Answer: it is not part of the scala code. Pascal wrote a Ruby script to perform them. For the first run (batch storing to **aws-frontend-archives-original**, see documentation folder **02-Batch-01**)

C. The batch "cleaning" was done using the scripts in documentation folder **03-Batch-02**.

D. Note that the scripts given **02-Batch-01** and **03-Batch-02**, are not portable. They are included to the documentaion for historical interest. The important thing is that the Dotcom team knows what the two [admin] routes are for.

E. One question that was left out from the above discussion is "How did you find the Interactive URLs ?", alternatively "How did you build [03.interactive-urls.txt](./02-Batch-01/03.interactive-urls.txt) ?" That list is the outcome of calling CAPI. This is done by the script **01-interactive-urls**.

### The cleaning process.

The `read-clean-write` routes call

```

def readCleanWrite(path: String): (Boolean, String) = {

  // The first component of the return value says whether the operation completed successfully,
  // in the negative case the string indicates what happened.

  val s3path = s"www.theguardian.com/${path}"
  retrieveOriginalDocumentFromS3(s3path).fold(
      (false, s"could not retrieve the original document at ${s3path}"),
    )(document => commitCleanedDocumentToS3(s3path, cleanOriginalDocument(document)))
}
```

Where the cleaning seems to happen in `cleanOriginalDocument`. At the time these lines are written, this function is the identity

```
def cleanOriginalDocument(document: String): String = {
    document
}
```

This highlights the following: The two routes in [admin] that perform Interactive Pressing, are unlikely to really change in the future, but this doesn't mean that the Librarian itself is finished. In fact the missing part of the librarian is really the cleaning function, which could not have been written when the Libraian was born because we didn't know at the time which cleaning would be required.

That function doesn't need to be written from scratch. There are cleaners dating back from R2 and R2 Pressing that can be reused or adapted. See code in [admin] / app / pagepresser

### The Future of the Librarian

The future of the Librarian, at the very moment the first version of this document is written (August 23rd, 2021) is

- Ideally, one day, we will find a way for DCR to render past interactives and get rid of the Librarian. (This might not happen actually...)

- The Interactive Pressing routes in [admin] will probably stay, the **content-presser** switch should remain off in normal circumstances and be activated by dotcom engineers when calling the routes for good reasons (for instance a new batch cleaning by calling the `read-clean-write` route).

- The team will figure out which kind of cleaning those past contents needs, update the `cleanOriginalDocument` function accordingly, and rerun the `read-clean-write` operation, for all past interactives. Note that an engineer will have to either adapt Pascal's scripts or write new ones in the programming language of their choice.

- The team will update the [applications] InteractiveController to implement the final logic. (It is unclear to me, at the time these lines are written, if all past interactives will be served from S3 or just some of them. That's a decision for the team. Once that implementation is made we can get rid of the **interactive-librarian** experiment.


