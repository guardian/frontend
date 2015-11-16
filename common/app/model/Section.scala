package model

import com.gu.contentapi.client.model.{Section => ApiSection}
import common.Pagination
import play.api.libs.json.{JsString, JsValue}

object Section {
  def make(section: ApiSection, pagination: Option[Pagination] = None): Section = {
    val id: String = section.id
    val sectionName = section.id
    val webUrl: String = section.webUrl
    val webTitle: String = section.webTitle

    val metadata = MetaData (
      id = id,
      webUrl = section.webUrl,
      url = SupportedUrl(section),
      section = sectionName,
      webTitle = webTitle,
      analyticsName = s"GFE:$sectionName",
      adUnitSuffix = AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(id, sectionName),
      isFront = true,
      rssPath = Some(s"/$id/rss"),
      iosType = sectionName match {
        case "crosswords" => None
        case _ => Some("front")
      }
    )

    val keywordIds: Seq[String] = frontKeywordIds(id)
    val keywordSponsorship = KeywordSponsorshipHandling(metadata, keywordIds)

    val javascriptConfigOverrides: Map[String, JsValue] = Map(
        "keywords" -> JsString(metadata.webTitle),
        "keywordIds" -> JsString(keywordIds.mkString(",")),
        "contentType" -> JsString("Section")
      )

    Section(
      metadata,
      keywordSponsorship,
      pagination = pagination,
      isEditionalised = section.editions.length > 1,
      javascriptConfigOverrides = javascriptConfigOverrides)
  }
}

case class Section private (
  override val metadata: MetaData,
  keywordSponsorship: KeywordSponsorshipHandling,
  pagination: Option[Pagination],
  isEditionalised: Boolean,
  javascriptConfigOverrides: Map[String, JsValue] = Map()
  ) extends Page {

  def getJavascriptConfig: Map[String, JsValue] =
    metadata.javascriptConfig ++
    javascriptConfigOverrides
}
