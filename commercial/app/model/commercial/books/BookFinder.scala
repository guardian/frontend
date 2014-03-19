package model.commercial.books

import common.{Logging, ExecutionContexts}
import scala.concurrent.Future

object BookFinder extends ExecutionContexts with Logging {

  def findByPageId(pageId: String): Future[Option[Book]] = {
    // This will be revisited when we implement high-relevance book components
    Future(None)
  }
}
