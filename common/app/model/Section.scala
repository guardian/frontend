package model

import com.gu.contentapi.client.model.v1.{Section => ApiSection}
import common.Pagination
import play.api.libs.json.{JsBoolean, JsString, JsValue}
import campaigns.PersonalInvestmentsCampaign

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
        "contentType" -> JsString("Section"),
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
      isEditionalised = section.editions.length > 1)
  }
}

case class Section private (
  override val metadata: MetaData,
  keywordSponsorship: KeywordSponsorshipHandling,
  isEditionalised: Boolean
  ) extends StandalonePage
