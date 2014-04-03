package controllers

import model.{FaciaPage, MetaData}


abstract class FrontPage(val isNetworkFront: Boolean) extends MetaData {
  override lazy val rssPath = Some(s"/$id/rss")
}

object FrontPage {

  val defaultDescription: String = "Latest news, comment and analysis from the Guardian, the world’s leading liberal voice"
  val networkFrontAnalytics: String = "GFE:Network Front"
  val defaultWebTitle: String = "Latest news, sport and comment from the Guardian"

  val networkFrontContentType: String = "Network Front"

  val defaultFrontPage: FrontPage = new FrontPage(isNetworkFront = true) {
    override val id = ""
    override val section = ""
    override val webTitle = defaultWebTitle
    override lazy val analyticsName = networkFrontAnalytics
    override lazy val description = Some(defaultDescription)

    override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
      "content-type" -> networkFrontContentType,
      "is-front" -> true
    )
  }

  private def getId(keyword: String): String = keyword.toLowerCase
  private def getSection(keyword: String): String = keyword.toLowerCase
  private def getAnalyticsName(keyword: String): String = s"GFE:${keyword.toLowerCase}"
  private def getDescription(keyword: String): String = s"Latest $keyword news, comment and analysis from the Guardian, the world’s leading liberal voice"

  def getFrontPageFromFaciaPage(faciaPage: FaciaPage): Option[FrontPage] = faciaPage.keyword.map { k =>
    new FrontPage(isNetworkFront = false) {
      override val id = getId(k)
      override val section = getSection(k)
      override val webTitle = faciaPage.webTitle
        .orElse(faciaPage.keyword.map(getDescription))
        .getOrElse(defaultDescription)
      override lazy val analyticsName = getAnalyticsName(k)
      override lazy val description = Some(getDescription(k))

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> k.capitalize,
        "content-type" -> k.capitalize,
        "is-front" -> true //Config agent trait logic?
      )
    }
  }.orElse(Option(defaultFrontPage))
}

