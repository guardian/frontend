package model

import com.gu.contentapi.client.model.v1.{Section => ApiSection}
import common.Pagination
import common.commercial.CommercialProperties
import navigation.GuardianFoundationHelper
import play.api.libs.json.{JsString, JsValue, Json}

object Section {
  def make(section: ApiSection, pagination: Option[Pagination] = None): Section = {
    val id: String = section.id
    val webTitle: String = section.webTitle

    val adUnitSuffix = AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(id, id)

    val keywordIds: Seq[String] = frontKeywordIds(id)

    val javascriptConfigOverrides: Map[String, JsValue] = Map(
      "keywords" -> JsString(webTitle),
      "keywordIds" -> JsString(keywordIds.mkString(",")),
    )

    val metadata = MetaData(
      id,
      webUrl = section.webUrl,
      url = SupportedUrl(section),
      section = Some(SectionId.fromCapiSection(section)),
      pillar = None,
      format = None,
      designType = None,
      pagination = pagination,
      webTitle = webTitle,
      adUnitSuffix = adUnitSuffix,
      contentType = Some(DotcomContentType.Section),
      isFront = true,
      rssPath = Some(s"/$id/rss"),
      iosType = id match {
        case "crosswords" => None
        case _            => Some("front")
      },
      javascriptConfigOverrides = javascriptConfigOverrides,
      commercial = Some(CommercialProperties.fromSection(section)),
      isFoundation = GuardianFoundationHelper.urlIsGuardianFoundation(section.webUrl) || GuardianFoundationHelper
        .sectionIdIsGuardianFoundation(id: String),
    )

    Section(
      metadata,
      isEditionalised = section.editions.length > 1,
    )
  }

}

case class Section private (
    override val metadata: MetaData,
    isEditionalised: Boolean,
) extends StandalonePage

case class SectionId(value: String) extends AnyVal

object SectionId {

  implicit val jsonFormat = Json.format[SectionId]

  def fromCapiSection(section: ApiSection): SectionId = SectionId(section.id)

  def fromId(id: String): SectionId = SectionId(id)
}

object Nielsen {
  private sealed trait Apid
  private case object Guardian extends Apid
  private case object Books extends Apid
  private case object Business extends Apid
  private case object CommentIsFree extends Apid
  private case object Culture extends Apid
  private case object Education extends Apid
  private case object Environment extends Apid
  private case object Fashion extends Apid
  private case object Film extends Apid
  private case object LifeStyle extends Apid
  private case object Media extends Apid
  private case object Money extends Apid
  private case object Music extends Apid
  private case object News extends Apid
  private case object Politics extends Apid
  private case object ProfessionalNetwork extends Apid
  private case object Science extends Apid
  private case object Society extends Apid
  private case object Sport extends Apid
  private case object Technology extends Apid
  private case object Travel extends Apid
  private case object TvRadio extends Apid

  private def apidToUuid(apid: Apid): String =
    apid match {
      case Guardian            => "2879C1E1-7EF9-459B-9C5C-6F4D2BC9DD53"
      case Books               => "4994D04B-4279-4184-A2C5-E8BB1DD50AB9"
      case Business            => "163BF72C-72D0-4702-82A9-17A548A39D79"
      case CommentIsFree       => "C962A2C3-C9E1-40DD-9B58-7B1095EDB16E"
      case Culture             => "87C0725C-D478-4567-967B-E3519ECD12E8"
      case Education           => "DD50B111-D493-4D25-8980-2B0752E16ED1"
      case Environment         => "FEC0766C-C766-4A77-91B3-74C5525E680F"
      case Fashion             => "1639B19E-B581-491E-94B7-FBACB6823C43"
      case Film                => "D5BB97FE-637C-4E9E-B972-C8EA88101CB7"
      case LifeStyle           => "B32533F9-65CF-4261-8BB9-2A707F59712A"
      case Media               => "385AA13F-9B64-4927-9536-BE70F9AD54BD"
      case Money               => "10BE8096-BF69-4252-AC27-C4127D8631F6"
      case Music               => "9D928193-7B5C-45A9-89E4-C47F42B8FB73"
      case News                => "66BEC53C-9890-477C-B639-60879EC4F762"
      case Politics            => "C5C73A36-9E39-4D42-9049-2528DB5E998D"
      case ProfessionalNetwork => "9DFEFF7E-9D45-4676-82B3-F29A6BF05BE1"
      case Science             => "F4867E05-4149-49F0-A9DE-9F3496930B8C"
      case Society             => "617F9FB9-2D34-4C3A-A2E7-383AE877A35D"
      case Sport               => "52A6516F-E323-449F-AA57-6A1B2386F8F6"
      case Technology          => "4F448B55-305F-4203-B192-8534CB606C12"
      case Travel              => "05A03097-D4CA-46BF-96AD-935252967239"
      case TvRadio             => "3277F0D0-9389-4A32-A4D6-516B49D87E45"
    }

  private val sectionIdToApid = Map[String, Apid](
    "books" -> Books,
    "childrens-books-site" -> Books,
    "business" -> Business,
    "better-business" -> Business,
    "business-to-business" -> Business,
    "working-in-development" -> Business,
    "commentisfree" -> CommentIsFree,
    "culture" -> Culture,
    "artanddesign" -> Culture,
    "culture-network" -> Culture,
    "culture-professionals-network" -> Culture,
    "games" -> Culture,
    "stage" -> Culture,
    "education" -> Education,
    "higher-education-network" -> Education,
    "teacher-network" -> Education,
    "environment" -> Environment,
    "animals-farmed" -> Environment,
    "fashion" -> Fashion,
    "film" -> Film,
    "lifeandstyle" -> LifeStyle,
    "media" -> Media,
    "money" -> Money,
    "music" -> Music,
    "news" -> News,
    "australia-news" -> News,
    "cardiff" -> News,
    "cities" -> News,
    "community" -> News,
    "edinburgh" -> News,
    "global-development" -> News,
    "government-computing-network" -> News,
    "law" -> News,
    "leeds" -> News,
    "local" -> News,
    "local-government-network" -> News,
    "media" -> News,
    "media-network" -> News,
    "uk-news" -> News,
    "us-news" -> News,
    "weather" -> News,
    "world" -> News,
    "politics" -> Politics,
    "guardian-professional" -> ProfessionalNetwork,
    "global-development-professionals-network" -> ProfessionalNetwork,
    "small-business-network" -> ProfessionalNetwork,
    "science" -> Science,
    "society" -> Society,
    "healthcare-network" -> Society,
    "housing-network" -> Society,
    "inequality" -> Society,
    "public-leaders-network" -> Society,
    "social-care-network" -> Society,
    "social-enterprise-network" -> Society,
    "society-professionals" -> Society,
    "women-in-leadership" -> Society,
    "sport" -> Sport,
    "football" -> Sport,
    "technology" -> Technology,
    "travel" -> Travel,
    "travel/offers" -> Travel,
    "tv-and-radio" -> TvRadio,
  )

  def apidFromString(sectionId: String): String = apidToUuid(sectionIdToApid.getOrElse(sectionId, Guardian))
}
