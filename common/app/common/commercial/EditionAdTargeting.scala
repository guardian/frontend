package common.commercial

import com.gu.commercial.display.{AdCall, AdCallParamKey, SurgeLookupService}
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
import play.api.libs.json.Json

case class EditionAdTargeting(edition: Edition, params: Map[String, String])

object EditionAdTargeting {

  implicit val editionAdTargetingFormat = Json.format[EditionAdTargeting]

  private val adCall = new AdCall(
    platform = "ng",
    surgeLookupService = new SurgeLookupService {
      // to be implemented
      def pageViewsPerMinute(pageId: String): Option[Int] = None
    }
  )

  private def editionTargeting(targeting: Edition => Map[AdCallParamKey, String]): Seq[EditionAdTargeting] = {

    def stringifyKeys(params: Map[AdCallParamKey, String]) = for ((k, v) <- params) yield (k.name, v)

    for (edition <- Edition.all)
      yield EditionAdTargeting(edition, params = stringifyKeys(targeting(edition)))
  }

  def fromContent(item: Content): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelContextTargeting(item, edition.id))

  def fromTag(tag: Tag): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelContextTargeting(tag, edition.id))

  def fromSection(section: Section): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelContextTargeting(section, edition.id))

  def forNetworkFront(frontId: String): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelContextTargeting(networkFrontPath = s"/$frontId", edition.id))

  def forFrontUnknownToCapi(frontId: String): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelTargetingForFrontUnknownToCapi(frontId, edition.id))
}
