package layout

import common.{Edition, LinkTo}
import model._
import model.pressed._
import play.api.mvc.RequestHeader

case class EditionalisedLink(
  baseUrl: String
) {
  import common.LinkTo._

  def get(implicit requestHeader: RequestHeader): String =
    LinkTo(baseUrl)(requestHeader)

  def hrefWithRel(implicit requestHeader: RequestHeader): String =
    processUrl(baseUrl, Edition(requestHeader)) match {
      case ProcessedUrl(url, true) => s"""href="$url" rel="nofollow""""
      case ProcessedUrl(url, false) => s"""href="$url""""
    }
}

object EditionalisedLink {
  def fromFaciaContent(faciaContent: PressedContent): EditionalisedLink =
    EditionalisedLink(SupportedUrl.fromFaciaContent(faciaContent))
}

