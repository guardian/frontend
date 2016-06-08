package model

import campaigns.PersonalInvestmentsCampaign
import com.gu.contentapi.client.model.v1.{Section => ApiSection}
import common.commercial.{BrandHunter, Branding}
import common.{Edition, Pagination}
import play.api.libs.json.{JsBoolean, JsString, JsValue}

object Section {
  def make(section: ApiSection, pagination: Option[Pagination] = None): Section = {
    val id: String = section.id
    val webTitle: String = section.webTitle
    val adUnitSuffix = AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(id, id)

    val keywordIds: Seq[String] = frontKeywordIds(id)
    val keywordSponsorship = KeywordSponsorshipHandling(id, adUnitSuffix, keywordIds)

    val javascriptConfigOverrides: Map[String, JsValue] = Map(
        "keywords" -> JsString(webTitle),
        "keywordIds" -> JsString(keywordIds.mkString(",")),
        "hasSuperStickyBanner" -> JsBoolean(PersonalInvestmentsCampaign.isRunning(keywordIds)),
        "isAdvertisementFeature" -> JsBoolean(keywordSponsorship.isAdvertisementFeature)
      )

    val metadata = MetaData (
      id,
      webUrl = section.webUrl,
      url = SupportedUrl(section),
      section = Some(SectionSummary.fromCapiSection(section)),
      pagination = pagination,
      webTitle = webTitle,
      analyticsName = s"GFE:$id",
      adUnitSuffix = adUnitSuffix,
      contentType = "Section",
      isFront = true,
      rssPath = Some(s"/$id/rss"),
      iosType = id match {
        case "crosswords" => None
        case _ => Some("front")
      },
      javascriptConfigOverrides = javascriptConfigOverrides
    )

    Section(
      metadata,
      keywordSponsorship,
      isEditionalised = section.editions.length > 1,
      activeBrandings = section.activeSponsorships map (_ map Branding.make(section.webTitle))
    )
  }
}

case class Section private (
  override val metadata: MetaData,
  keywordSponsorship: KeywordSponsorshipHandling,
  isEditionalised: Boolean,
  activeBrandings: Option[Seq[Branding]]
  ) extends StandalonePage {

  override def branding(edition: Edition): Option[Branding] = {
    BrandHunter.findBranding(metadata.section.flatMap(_.activeBrandings), edition, publicationDate = None)
  }
}

case class SectionSummary(
  id: String,
  activeBrandings: Option[Seq[Branding]]
)

object SectionSummary {

  def fromCapiSection(section: ApiSection): SectionSummary = {
    SectionSummary(
      id = section.id,
      activeBrandings = section.activeSponsorships map (_ map Branding.make(section.webTitle))
    )
  }

  def fromId(sectionId: String): SectionSummary = SectionSummary(id = sectionId, activeBrandings = None)
}
