package common.commercial

import com.gu.commercial.display.{AdCall, AdCallParamKey}
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
import ophan.SurgingContentAgent
import play.api.libs.json.Json

case class EditionAdTargeting(edition: Edition, params: Map[String, String])

object EditionAdTargeting {

  implicit val editionAdTargetingFormat = Json.format[EditionAdTargeting]

  private val adCall = new AdCall(
    platform = "ng",
    surgeLookupService = SurgingContentAgent
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

  def targeting(adContextTargetings: Option[Seq[EditionAdTargeting]], edition: Edition): Map[String, String] = {
    val params = for {
      targetings <- adContextTargetings
      targeting <- targetings.find(_.edition == edition)
    } yield targeting.params
    params getOrElse Map.empty
  }
}
