package model

import campaigns.PersonalInvestmentsCampaign
import com.gu.contentapi.client.model.v1.{Section => ApiSection}
import common.Pagination
import common.commercial.EditionBranding
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
      section = Some(SectionSummary.fromCapiSection(section)),
      pagination = pagination,
      webTitle = webTitle,
      adUnitSuffix = adUnitSuffix,
      contentType = "Section",
      isFront = true,
      rssPath = Some(s"/$id/rss"),
      iosType = id match {
        case "crosswords" => None
        case _ => Some("front")
      },
      javascriptConfigOverrides = javascriptConfigOverrides,
      editionBrandings = Some(EditionBranding.fromSection(section))
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

case class SectionSummary(id: String)

object SectionSummary {

  implicit val jsonFormat = Json.format[SectionSummary]

  def fromCapiSection(section: ApiSection): SectionSummary = SectionSummary(id = section.id)

  def fromId(sectionId: String): SectionSummary = SectionSummary(id = sectionId)
}
