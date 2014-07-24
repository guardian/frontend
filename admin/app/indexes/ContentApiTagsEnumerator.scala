package indexes

import common.Logging
import conf.LiveContentApi

import scala.concurrent.Future
import com.gu.openplatform.contentapi.model.{Tag, TagsResponse}
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.iteratee.{Enumeratee, Enumerator}

object ContentApiTagsEnumerator extends Logging {
  val DelayBetweenRetries = 100.millis
  val MaxNumberRetries = 5
  val MaxPageSize = 1000

  def enumeratePages(getPage: Int => Future[TagsResponse]): Enumerator[Tag] = {
    def getPageWithRetries(page: Int, retriesRemaining: Int = MaxNumberRetries): Future[TagsResponse] =
      if (retriesRemaining == 0)
        getPage(page)
      else
        getPage(page) recoverWith {
          case error: Throwable =>
            log.error(s"Error getting tag page $page, $retriesRemaining retries remaining", error)
            getPageWithRetries(page, retriesRemaining - 1)
        }

    Enumerator.unfoldM(Option(1)) {
      case Some(nextPage) => getPageWithRetries(nextPage) map { response =>
        val next = if (response.isLastPage) None else Some(response.currentPage + 1)

        Some(next, response.results)
      }

      case None => Future.successful(None)
    }.flatMap(Enumerator.apply(_: _*))
  }

  def enumerateTagType(tagType: String) = enumeratePages { page =>
    LiveContentApi.tags.tagType(tagType).pageSize(MaxPageSize).page(page).response
  }

  def enumerateTagTypeFiltered(tagType: String) =
    enumerateTagType(tagType) through Enumeratee.filter({ tag =>
      /** Believe it or not, we actually have tags whose titles start with HTML tags ... */
      !tag.id.startsWith("weather/") && tag.webTitle.charAt(0).isLetterOrDigit
    })
}
