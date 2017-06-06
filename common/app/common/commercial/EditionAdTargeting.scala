package common.commercial

import com.gu.commercial.display._
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
import services.ophan.SurgingContentAgent
import play.api.libs.json._

case class EditionAdTargeting(edition: Edition, params: Map[AdCallParamKey, AdCallParamValue])

object EditionAdTargeting {

  implicit val adTargetingFormat: Format[Map[AdCallParamKey, AdCallParamValue]] = {

    def adCallParamKeyByName(name: String): AdCallParamKey = name match {
      case AuthorKey.name      => AuthorKey
      case BlogKey.name        => BlogKey
      case BrandingKey.name    => BrandingKey
      case ContentTypeKey.name => ContentTypeKey
      case EditionKey.name     => EditionKey
      case KeywordKey.name     => KeywordKey
      case ObserverKey.name    => ObserverKey
      case PathKey.name        => PathKey
      case PlatformKey.name    => PlatformKey
      case SeriesKey.name      => SeriesKey
      case SurgeLevelKey.name  => SurgeLevelKey
      case ToneKey.name        => ToneKey
      case _                   => KeywordKey
    }

    new Format[Map[AdCallParamKey, AdCallParamValue]] {

      def reads(json: JsValue): JsResult[Map[AdCallParamKey, AdCallParamValue]] = json match {
        case JsObject(jsonMap) =>
          JsSuccess(
            jsonMap.toMap flatMap {
              case (k, JsString(v)) =>
                Some(adCallParamKeyByName(k) -> SingleValue(v))
              case (k, JsArray(jsonSeq)) =>
                Some(adCallParamKeyByName(k) -> MultipleValues(jsonSeq.collect { case JsString(v) => v }.toSet))
              case _ =>
                None
            }
          )
        case _ =>
          JsSuccess(Map.empty)
      }

      def writes(o: Map[AdCallParamKey, AdCallParamValue]): JsValue = JsObject {
        o map {
          case (k, v) =>
            k.name -> (
              v match {
                case v: SingleValue    => JsString(v.value)
                case v: MultipleValues => JsArray(v.values.toSeq.map(JsString))
              }
            )
        }
      }
    }
  }

  implicit val editionAdTargetingFormat = Json.format[EditionAdTargeting]

  private val adCall = new AdCall(
    platform = "ng",
    surgeLookupService = SurgingContentAgent
  )

  private def editionTargeting(targeting: Edition => Map[AdCallParamKey, AdCallParamValue]): Seq[EditionAdTargeting] =
    for (edition <- Edition.all) yield EditionAdTargeting(edition, params = targeting(edition))

  def fromContent(item: Content): Seq[EditionAdTargeting] =
    editionTargeting { edition =>
      adCall.pageLevelTargetingForContentPage(item)(edition.id)
    }

  def fromTag(tag: Tag): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelTargetingForTagPage(edition.id)(tag))

  def fromSection(section: Section): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelTargetingForSectionFront(edition.id)(section))

  def forNetworkFront(frontId: String): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelTargetingForNetworkFront(edition.id)(networkFrontPath = s"/$frontId"))

  def forFrontUnknownToCapi(frontId: String): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelTargetingForFrontUnknownToCapi(edition.id)(frontId))
}
