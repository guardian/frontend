package indexes

import common.GuLogging
import common.StringEncodings.asAscii
import contentapi.ContentApiClient

import scala.concurrent.{ExecutionContext, Future}
import com.gu.contentapi.client.model.v1.{Tag, TagsResponse}

import scala.concurrent.duration._

class ContentApiTagsEnumerator(contentApiClient: ContentApiClient)(implicit executionContext: ExecutionContext)
    extends GuLogging {
  val DelayBetweenRetries = 100.millis
  val MaxNumberRetries = 5
  val MaxPageSize = 1000

  def enumerateTagType(tagType: String): Future[Seq[Tag]] = {
    val tagQuery = contentApiClient.tags.tagType(tagType).pageSize(MaxPageSize)
    contentApiClient.thriftClient.paginateAccum(tagQuery)(
      { r: TagsResponse => r.results.filter(isSuitableTag) },
      { (a: Seq[Tag], b: Seq[Tag]) => a ++ b },
    )
  }

  implicit class RichTag(tag: Tag) {
    def isSectionTag: Boolean =
      tag.id.split("/").toList match {
        case first :: second :: Nil => first == second
        case _                      => false
      }
  }

  private def isSuitableTag(tag: Tag): Boolean = {

    /** Believe it or not, we actually have tags whose titles start with HTML tags ... */
    !tag.id.startsWith("weather/") && asAscii(tag.webTitle).charAt(0).isLetterOrDigit
  }
}
