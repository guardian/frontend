package indexes

import common.Logging
import conf.LiveContentApi

import scala.concurrent.Future
import com.gu.openplatform.contentapi.model.{Tag, TagsResponse}
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.iteratee.Enumerator

trait AllTagsEnumerator extends Logging {
  val DelayBetweenRetries = 100.millis
  val MaxNumberRetries = 5

  def getPage(page: Int): Future[TagsResponse]

  protected def getPageWithRetries(page: Int, retriesRemaining: Int = MaxNumberRetries): Future[TagsResponse] =
    if (retriesRemaining == 0)
      getPage(page)
    else
      getPage(page) recoverWith {
        case error: Throwable =>
          log.error(s"Error getting tag page $page, $retriesRemaining retries remaining", error)
          getPageWithRetries(page, retriesRemaining - 1)
      }

  val allTags: Enumerator[Tag] = Enumerator.unfoldM(Option(1)) {
    case Some(nextPage) => getPageWithRetries(nextPage) map { response =>
      val next = if (response.isLastPage) None else Some(response.currentPage + 1)

      Some(next, response.results)
    }

    case None => Future.successful(None)
  }.flatMap(Enumerator.apply(_: _*))
}

object AllTagsEnumerator extends AllTagsEnumerator {
  val MaxPageSize = 1000

  override def getPage(page: Int): Future[TagsResponse] = {
    log.info(s"Requesting page $page of Content API tags")
    LiveContentApi.tags.pageSize(MaxPageSize).page(page).response
  }
}