package model.commercial.books

import common.{Logging, ExecutionContexts}
import common.Edition.defaultEdition
import scala.concurrent.Future
import conf.ContentApi

object BookFinder extends ExecutionContexts with Logging {

  def findByPageId(pageId: String): Future[Option[Book]] = {
    (for {
      capiResponse <- ContentApi.item(pageId, defaultEdition).showFactboxes("book").response
    } yield {
      for {
        content <- capiResponse.content
        factbox = content.factboxes.head
        fields <- factbox.fields
        title <- fields.get("title")
        author <- fields.get("author")
        isbn <- fields.get("isbn13")
      } yield {
        Book(
          title = title,
          author = Some(author),
          isbn = isbn,
          jacketUrl = factbox.picture,
          price = 0,
          offerPrice = None,
          description = None,
          buyUrl = "",
          position = 0,
          category = "",
          keywords = Nil
        )
      }
    }).recover {
      case e =>
        log.warn(s"Failed to look up [$pageId]: ${e.getMessage}")
        None
    }
  }
}
