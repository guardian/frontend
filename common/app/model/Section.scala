package model

import campaigns.PersonalInvestmentsCampaign
import com.gu.contentapi.client.model.v1.{Section => ApiSection}
import common.commercial.BrandHunter
import common.{Edition, Pagination}
import play.api.libs.json.{JsBoolean, JsString, JsValue}

object Section {
  def make(section: ApiSection, pagination: Option[Pagination] = None): Section = {
    val id: String = section.id
    val sectionName = section.id
    val webUrl: String = section.webUrl
    val webTitle: String = section.webTitle
    val adUnitSuffix = AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(id, sectionName)

    val keywordIds: Seq[String] = frontKeywordIds(id)
    val keywordSponsorship = KeywordSponsorshipHandling(id, adUnitSuffix, keywordIds)

    val javascriptConfigOverrides: Map[String, JsValue] = Map(
        "keywords" -> JsString(webTitle),
        "keywordIds" -> JsString(keywordIds.mkString(",")),
        "hasSuperStickyBanner" -> JsBoolean(PersonalInvestmentsCampaign.isRunning(keywordIds)),
        "isAdvertisementFeature" -> JsBoolean(keywordSponsorship.isAdvertisementFeature)
      )

    val metadata = MetaData (
      id = id,
      webUrl = section.webUrl,
      url = SupportedUrl(section),
      section = sectionName,
      pagination = pagination,
      webTitle = webTitle,
      analyticsName = s"GFE:$sectionName",
      adUnitSuffix = adUnitSuffix,
      contentType = "Section",
      isFront = true,
      rssPath = Some(s"/$id/rss"),
      iosType = sectionName match {
        case "crosswords" => None
        case _ => Some("front")
      },
      javascriptConfigOverrides = javascriptConfigOverrides
    )

    Section(
      metadata,
      keywordSponsorship,
      isEditionalised = section.editions.length > 1,
      activeBrandings = section.activeSponsorships map (_ map Branding.make)
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
    BrandHunter.findSectionBranding(this, publicationDate = None, edition)
  }
}
