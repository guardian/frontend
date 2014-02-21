package model.commercial.books

import common.{Logging, ExecutionContexts}
import common.Edition.defaultEdition
import scala.concurrent.Future
import conf.ContentApiDoNotUseForNewQueries

object BookFinder extends ExecutionContexts with Logging {

  def findByPageId(pageId: String): Future[Option[Book]] = {
    (for {            // TODO using old content api till factboxes are in new content api
      capiResponse <- ContentApiDoNotUseForNewQueries.item(pageId, defaultEdition).showFactboxes("book").response
    } yield {
      for {
        content <- capiResponse.content
        factbox <- content.factboxes.headOption
        fields <- factbox.fields
        title <- fields.get("title")
        author <- fields.get("author")
        isbn <- fields.get("isbn13")
      } yield {
        Book(
          title = title,
          author = Some(author),
          isbn = isbn,
          jacketUrl = factbox.picture
        )
      }
    }).recover {
      case e =>
        log.warn(s"Failed to look up [$pageId]: ${e.getMessage}")
        None
    }
  }
}
