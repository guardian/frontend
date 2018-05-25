package model

import commercial.campaigns.PersonalInvestmentsCampaign
import com.gu.contentapi.client.model.v1.{Section => ApiSection}
import common.Pagination
import common.commercial.CommercialProperties
import play.api.libs.json.{JsBoolean, JsString, JsValue, Json}

object Section {
  def make(section: ApiSection, pagination: Option[Pagination] = None): Section = {
    val id: String = section.id
    val webTitle: String = section.webTitle
    val adUnitSuffix = AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(id, id)

    val keywordIds: Seq[String] = frontKeywordIds(id)

    val javascriptConfigOverrides: Map[String, JsValue] = Map(
      "keywords" -> JsString(webTitle),
      "keywordIds" -> JsString(keywordIds.mkString(",")),
      "hasSuperStickyBanner" -> JsBoolean(PersonalInvestmentsCampaign.isRunning(keywordIds))
    )

    val metadata = MetaData (
      id,
      webUrl = section.webUrl,
      url = SupportedUrl(section),
      section = Some(SectionId.fromCapiSection(section)),
      pillar = None,
      designType = None,
      pagination = pagination,
      webTitle = webTitle,
      adUnitSuffix = adUnitSuffix,
      contentType = Some(DotcomContentType.Section),
      isFront = true,
      rssPath = Some(s"/$id/rss"),
      iosType = id match {
        case "crosswords" => None
        case _ => Some("front")
      },
      javascriptConfigOverrides = javascriptConfigOverrides,
      commercial = Some(CommercialProperties.fromSection(section))
    )

    Section(
      metadata,
      isEditionalised = section.editions.length > 1
    )
  }
}

case class Section private(
  override val metadata: MetaData,
  isEditionalised: Boolean
) extends StandalonePage

case class SectionId(value: String) extends AnyVal

object SectionId {

  implicit val jsonFormat = Json.format[SectionId]

  def fromCapiSection(section: ApiSection): SectionId = SectionId(section.id)

  def fromId(id: String): SectionId = SectionId(id)
}

object Neilsen {
  private val sectionIdToApid = Map(
    "books" -> "4994D04B-4279-4184-A2C5-E8BB1DD50AB9",
    "business" -> "163BF72C-72D0-4702-82A9-17A548A39D79",
    "commentisfree" -> "C962A2C3-C9E1-40DD-9B58-7B1095EDB16E",
    "culture" -> "87C0725C-D478-4567-967B-E3519ECD12E8",
    "education" -> "DD50B111-D493-4D25-8980-2B0752E16ED1",
    "environment" -> "FEC0766C-C766-4A77-91B3-74C5525E680F",
    "fashion" -> "1639B19E-B581-491E-94B7-FBACB6823C43",
    "film" -> "D5BB97FE-637C-4E9E-B972-C8EA88101CB7",
    "lifeandstyle" -> "B32533F9-65CF-4261-8BB9-2A707F59712A",
    "media" -> "385AA13F-9B64-4927-9536-BE70F9AD54BD",
    "money" -> "10BE8096-BF69-4252-AC27-C4127D8631F6",
    "music" -> "9D928193-7B5C-45A9-89E4-C47F42B8FB73",
    "news" -> "66BEC53C-9890-477C-B639-60879EC4F762",
    "politics" -> "C5C73A36-9E39-4D42-9049-2528DB5E998D",
    "guardian-professional" -> "9DFEFF7E-9D45-4676-82B3-F29A6BF05BE1",
    "science" -> "F4867E05-4149-49F0-A9DE-9F3496930B8C",
    "society" -> "617F9FB9-2D34-4C3A-A2E7-383AE877A35D",
    "sport" -> "52A6516F-E323-449F-AA57-6A1B2386F8F6",
    "technology" -> "4F448B55-305F-4203-B192-8534CB606C12",
    "travel" -> "05A03097-D4CA-46BF-96AD-935252967239",
    "tv-and-radio" -> "3277F0D0-9389-4A32-A4D6-516B49D87E45"
  )

  def apidFromString(sectionId: String): String = sectionIdToApid.getOrElse(sectionId, "2879C1E1-7EF9-459B-9C5C-6F4D2BC9DD53")
}
