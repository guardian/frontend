# Static Analysis

## Context
See [corresponding PR](https://github.com/guardian/frontend/pull/28816)

This module uses scala's [semanticDB](https://scalameta.org/docs/semanticdb/guide.html) and scala-meta in order to analyse the codebase and figure out which twirl template is used by which controller.
This was implemented within a broader piece of work about code deletion in this application. Given the sheer size of frontend it made sense to invest the engineering time to automate this discovery.

## Usage

- modify ./project/ProjectSettings.scala, and add these options for all modules:
```scala
    semanticdbEnabled := true,
    semanticdbVersion := scalafixSemanticdb.revision,
    scalacOptions ++= Seq(
      "-Wunused",
      "-Wconf:cat=unused:info",
    )
```
- in sbt: `reload`, `clean`, `compile` and `Test / compile`
- still in sbt `project static-analysis` then `run`

## How does this work?

The scala compiler has a feature called semanticDB that generates metadata about each scala file during the compilation phase.
This data contains which symbols (classes, traits, objects, methods, variable etc) are declared in the file as well as which symbol are referenced within the file.

At the file level this isn't very useful to us, but at a codebase level this allows us to understand the relationship between symbols.
However the semanticDB isn't enough for us to which method is calling which symbol.

For this we need the scala AST (abstract syntax tree), which luckily can be easily obtained using scala-meta's toolkit.

Combining this two datasets, and with enough perserverance it's possible to build "Call Hierarchies" (or [call graphs](https://en.wikipedia.org/wiki/Call_graph)) like this:
```
views/html/fragments/email/emailArticleBody. in article/target/scala-2.13/twirl/main/views/html/fragments/email/emailArticleBody.template.scala:18:7
  views/html/fragments/email/emailArticleBody. in article/app/pages/ArticleEmailHtmlPage.scala:7:35
    No call to views/html/fragments/email/emailArticleBody. found (entry point)
  views/html/fragments/email/emailArticleBody. in article/app/pages/ArticleEmailHtmlPage.scala:20:8
    pages/ArticleEmailHtmlPage.html(). in article/app/controllers/LiveBlogController.scala:50:70
      controllers/LiveBlogController#renderEmail(). in article/target/scala-2.13/routes/main/router/Routes.scala:152:25
        router/Routes# in article/target/scala-2.13/routes/main/router/Routes.scala:41:37
        ...
      controllers/LiveBlogController#renderEmail(). in article/target/scala-2.13/routes/main/router/Routes.scala:188:25
        router/Routes# in article/target/scala-2.13/routes/main/router/Routes.scala:41:37
          No call to router/Routes# found (entry point)
        ...
    pages/ArticleEmailHtmlPage.html(). in article/app/controllers/ArticleController.scala:103:66
      controllers/ArticleController#render(). in article/app/controllers/ArticleController.scala:43:42
        controllers/ArticleController#mapAndRender(). in article/app/controllers/ArticleController.scala:38:4
          controllers/ArticleController#renderItem(). in article/app/controllers/PublicationController.scala:49:26
            controllers/PublicationController#publishedOn(). in article/target/scala-2.13/routes/main/router/Routes.scala:332:28
              router/Routes# in article/target/scala-2.13/routes/main/router/Routes.scala:41:37
                No call to router/Routes# found (entry point)
              ...
            controllers/PublicationController#publishedOn(). in article/target/scala-2.13/routes/main/router/Routes.scala:461:93
              No call to controllers/PublicationController#publishedOn(). found (entry point)
            controllers/PublicationController#publishedOn(). in article/test/PublicationControllerTest.scala:48:39
              test/PublicationControllerTest# in article/test/package.scala:12:10
                No call to test/PublicationControllerTest# found (entry point)
              ... more tests
```

Finally, with these call hierarchies we're able to build the mapping between controllers `controllers/PublicationController#publishedOn()` and twirl template `views/html/fragments/email/emailArticleBody`.
Initial results confirm the intuition that automation was necessary as we find almost 1300 such relations between controllers and twirl templates.

## Potential uses

Beyound building the inventory that will help use decide what to keep, what to delete and what to migrate, we can imagine using these capabilities to automatically flag all the code trees that are candidates for deletion by only giving a list of controllers we would like to remove.
This would require more work and is beyound the scope of this initial step.
