package indexes

import common.Logging
import common.StringEncodings.asAscii
import conf.LiveContentApi
import LiveContentApi.getResponse

import scala.concurrent.Future
import com.gu.contentapi.client.model.v1.Tag
import com.gu.contentapi.client.model.TagsResponse
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
    getResponse(LiveContentApi.tags.tagType(tagType).pageSize(MaxPageSize).page(page))
  }

  implicit class RichTag(tag: Tag) {
    def isSectionTag = tag.id.split("/").toList match {
      case first :: second :: Nil => first == second
      case _ => false
    }
  }

  def enumerateTagTypeFiltered(tagType: String) =
    enumerateTagType(tagType) through Enumeratee.filter({ tag =>
      /** Believe it or not, we actually have tags whose titles start with HTML tags ... */
      !tag.id.startsWith("weather/") && asAscii(tag.webTitle).charAt(0).isLetterOrDigit
    })
}
