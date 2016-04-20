package model

import com.gu.contentapi.client.model.v1.{Section => ApiSection}
import common.Pagination
import play.api.libs.json.{JsBoolean, JsString, JsValue}
import org.joda.time.DateTime

object Section {
  def make(section: ApiSection, pagination: Option[Pagination] = None): Section = {
    val id: String = section.id
    val sectionName = section.id
    val webUrl: String = section.webUrl
    val webTitle: String = section.webTitle
    val adUnitSuffix = AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(id, sectionName)

    val keywordIds: Seq[String] = frontKeywordIds(id)
    val keywordSponsorship = KeywordSponsorshipHandling(id, adUnitSuffix, keywordIds)

    // The PI campaign will run for one year, during which all the related pages must provide a sticky
    // banner at the top that sticks all the way through, therefore overriding other config flags
    // such as isAdvertisementFeature
    lazy val isPersonalInvestmentsCampaign: Boolean = keywordIds.exists(t => t.endsWith("/personal-investments"))
    lazy val isPersonalInvestmentsCampaignRunning: Boolean = DateTime.now().isBefore(new DateTime(2017, 4, 26, 0, 0))

    val javascriptConfigOverrides: Map[String, JsValue] = Map(
        "keywords" -> JsString(webTitle),
        "keywordIds" -> JsString(keywordIds.mkString(",")),
        "hasSuperStickyBanner" -> JsBoolean(isPersonalInvestmentsCampaign && isPersonalInvestmentsCampaignRunning),
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
