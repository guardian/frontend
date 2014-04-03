package controllers

import model.MetaData


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

  def getId(webTitle: String): String = webTitle.toLowerCase
  def getSection(webTitle: String): String = webTitle.toLowerCase
  def getAnalyticsName(webTitle: String): String = s"GFE:${webTitle.toLowerCase}"
  def getDescription(webTitle: String): String = s"Latest $webTitle news, comment and analysis from the Guardian, the world’s leading liberal voice"
  def getFullWebTitle(webTitle: String): String = getDescription(webTitle)

  def getFrontPageFromWebTitle(webtitle: Option[String]): Option[FrontPage] = webtitle.map { w =>
    new FrontPage(isNetworkFront = false) {
      override val id = getId(w)
      override val section = getSection(w)
      override val webTitle = getFullWebTitle(w)
      override lazy val analyticsName = getAnalyticsName(w)
      override lazy val description = Some(getDescription(w))

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> w.capitalize,
        "content-type" -> w.capitalize,
        "is-front" -> true //Config agent trait logic?
      )
    }
  }.orElse(Option(defaultFrontPage))
}

