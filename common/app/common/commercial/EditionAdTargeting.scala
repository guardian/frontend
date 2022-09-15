package common.commercial

import com.gu.commercial.display._
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
import play.api.libs.json._
import services.ophan.SurgingContentAgent

case class EditionAdTargeting(edition: Edition, paramSet: Option[Set[AdTargetParam]])

object EditionAdTargeting {

  implicit val adTargetParamValueWrites: Writes[AdTargetParamValue] = new Writes[AdTargetParamValue] {
    override def writes(o: AdTargetParamValue) =
      o match {
        case SingleValue(value)     => Json.toJson(value)
        case MultipleValues(values) => Json.toJson(values)
      }
  }

  implicit val adTargetParamFormat: Format[AdTargetParam] = new Format[AdTargetParam] {

    implicit val singleValueReads: Reads[SingleValue] = new Reads[SingleValue] {
      override def reads(json: JsValue) =
        JsSuccess(json match {
          case JsString(v) => SingleValue(v)
          case _           => SingleValue.empty
        })
    }

    implicit val multipleValuesReads: Reads[MultipleValues] = new Reads[MultipleValues] {
      def reads(json: JsValue) =
        JsSuccess(json match {
          case JsArray(vs) => MultipleValues(vs.collect { case JsString(v) => v }.toSet)
          case _           => MultipleValues.empty
        })
    }

    override def writes(o: AdTargetParam) =
      Json.obj(
        "name" -> o.name,
        "value" -> o.value,
      )

    override def reads(json: JsValue) =
      JsSuccess {
        val name = (json \ "name").asOpt[String]
        name match {
          case Some(AuthorParam.name)      => AuthorParam((json \ "value").as[MultipleValues])
          case Some(BlogParam.name)        => BlogParam((json \ "value").as[MultipleValues])
          case Some(BrandingParam.name)    => BrandingParam((json \ "value").as[SingleValue])
          case Some(ContentTypeParam.name) => ContentTypeParam((json \ "value").as[SingleValue])
          case Some(EditionParam.name)     => EditionParam((json \ "value").as[SingleValue])
          case Some(KeywordParam.name)     => KeywordParam((json \ "value").as[MultipleValues])
          case Some(ObserverParam.name)    => ObserverParam((json \ "value").as[SingleValue])
          case Some(PathParam.name)        => PathParam((json \ "value").as[SingleValue])
          case Some(PlatformParam.name)    => PlatformParam((json \ "value").as[SingleValue])
          case Some(SeriesParam.name)      => SeriesParam((json \ "value").as[MultipleValues])
          case Some(ShortUrlParam.name)    => ShortUrlParam((json \ "value").as[SingleValue])
          case Some(SurgeLevelParam.name)  => SurgeLevelParam((json \ "value").as[MultipleValues])
          case Some(ToneParam.name)        => ToneParam((json \ "value").as[MultipleValues])
          case _                           => UnknownParam
        }
      }
  }

  implicit val editionAdTargetingFormat = Json.format[EditionAdTargeting]

  private val adTargeter = new AdTargeter(
    platform = "ng",
    surgeLookupService = SurgingContentAgent,
  )

  private def editionTargeting(targeting: Edition => Set[AdTargetParam]): Set[EditionAdTargeting] =
    for (edition <- Edition.allWithBetaEditions.toSet[Edition]) yield EditionAdTargeting(edition, paramSet = Some(targeting(edition)))

  def fromContent(item: Content): Set[EditionAdTargeting] =
    editionTargeting { edition =>
      adTargeter.pageLevelTargetingForContentPage(edition.id)(item)
    }

  def fromTag(tag: Tag): Set[EditionAdTargeting] =
    editionTargeting { edition =>
      adTargeter.pageLevelTargetingForTagPage(edition.id)(tag)
    }

  def fromSection(section: Section): Set[EditionAdTargeting] =
    editionTargeting { edition =>
      adTargeter.pageLevelTargetingForSectionFront(edition.id)(section)
    }

  def forNetworkFront(frontId: String): Set[EditionAdTargeting] =
    editionTargeting { edition =>
      adTargeter.pageLevelTargetingForNetworkFront(edition.id)(networkFrontPath = s"/$frontId")
    }

  def forFrontUnknownToCapi(frontId: String): Set[EditionAdTargeting] =
    editionTargeting { edition =>
      adTargeter.pageLevelTargetingForFrontUnknownToCapi(edition.id)(frontId)
    }
}
