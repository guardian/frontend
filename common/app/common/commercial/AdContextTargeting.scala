package common.commercial

import com.gu.commercial.display.{AdCall, AdCallParamKey, SurgeLookupService}
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
import play.api.libs.json.Json

case class AdContextTargeting(edition: Edition, params: Map[String, String])

object AdContextTargeting {

  implicit val adContextTargetingFormat = Json.format[AdContextTargeting]

  private val adCall = new AdCall(
    platform = "ng",
    surgeLookupService = new SurgeLookupService {
      // to be implemented
      def pageViewsPerMinute(pageId: String): Option[Int] = None
    }
  )

  private def editionTargeting(targeting: Edition => Map[AdCallParamKey, String]): Seq[AdContextTargeting] = {

    def stringifyKeys(params: Map[AdCallParamKey, String]) = for ((k, v) <- params) yield (k.name, v)

    for (edition <- Edition.all)
      yield AdContextTargeting(edition, params = stringifyKeys(targeting(edition)))
  }

  def fromContent(item: Content): Seq[AdContextTargeting] =
    editionTargeting(edition => adCall.pageLevelContextTargeting(item, edition.id))

  def fromTag(tag: Tag): Seq[AdContextTargeting] =
    editionTargeting(edition => adCall.pageLevelContextTargeting(tag, edition.id))

  def fromSection(section: Section): Seq[AdContextTargeting] =
    editionTargeting(edition => adCall.pageLevelContextTargeting(section, edition.id))

  def targeting(adContextTargetings: Option[Seq[AdContextTargeting]], edition: Edition): Map[String, String] = {
    val params = for {
      targetings <- adContextTargetings
      targeting <- targetings.find(_.edition == edition)
    } yield targeting.params
    params getOrElse Map.empty
  }
}
