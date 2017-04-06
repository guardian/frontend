package common.commercial

import com.gu.commercial.display._
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
import ophan.SurgingContentAgent
import play.api.libs.json._

case class EditionAdTargeting(edition: Edition, params: Map[String, Either[String, Set[String]]])

object EditionAdTargeting {

  implicit val paramsWrites = new Writes[Either[String, Set[String]]] {
    def writes(location: Either[String, Set[String]]) = location match {
      case Left(v) => Json.toJson(v)
      case Right(vs) => Json.toJson(vs)
    }
  }

  implicit val paramsReads = new Reads[Either[String, Set[String]]] {
    override def reads(json: JsValue) = json match {
      case JsString(v) =>
        JsSuccess(Left(v))
      case JsArray(js) =>
        JsSuccess(Right(js.flatMap {
          case JsString(v) => Some(v)
          case _ => None
        }.toSet))
      case _ => JsError(s"Failed to read ad targeting param $json")
    }
  }

  implicit val editionAdTargetingFormat = Json.format[EditionAdTargeting]

  private val adCall = new AdCall(
    platform = "ng",
    surgeLookupService = SurgingContentAgent
  )

  private def editionTargeting(targeting: Edition => Map[AdCallParamKey, AdCallParamValue]): Seq[EditionAdTargeting] = {

    def stringify(params: Map[AdCallParamKey, AdCallParamValue]) = for ((k, v) <- params) yield {
      k.name -> {
        v match {
          case sv: SingleValue => Left(sv.toCleanString)
          case mv: MultipleValues => Right(mv.toCleanStrings)
        }
      }
    }

    for (edition <- Edition.all)
      yield EditionAdTargeting(edition, params = stringify(targeting(edition)))
  }

  def fromContent(item: Content): Seq[EditionAdTargeting] =
    editionTargeting { edition =>
      adCall.pageLevelTargetingForContentPage(item)(edition.id)
    }

  def fromTag(tag: Tag): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelTargetingForTagPage(tag)(edition.id))

  def fromSection(section: Section): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelTargetingForSectionFront(section)(edition.id))

  def forNetworkFront(frontId: String): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelTargetingForNetworkFront(networkFrontPath = s"/$frontId")(edition.id))

  def forFrontUnknownToCapi(frontId: String): Seq[EditionAdTargeting] =
    editionTargeting(edition => adCall.pageLevelTargetingForFrontUnknownToCapi(frontId)(edition.id))
}
