package model

import common.Edition
import controllers.FrontPage
import conf.Switches

case class FaciaPage(
                      id: String,
                      seoData: SeoData,
                      collections: List[(Config, Collection)]) extends MetaData {

  lazy val frontPage: FrontPage = FrontPage(this)

  private val isNewSeoOn: Boolean = Switches.NewSeoSwitch.isSwitchedOn
  def oldOrNewSeo[T](oldValue: => T, newValue: => T): T = if (isNewSeoOn) newValue else oldValue

  override lazy val description: Option[String] = oldOrNewSeo(frontPage.description, seoData.description)
  override lazy val section: String = oldOrNewSeo(frontPage.section, seoData.section)
  override lazy val analyticsName: String = oldOrNewSeo(frontPage.analyticsName, s"GFE:${seoData.webTitle.capitalize}")
  override lazy val webTitle: String = oldOrNewSeo(frontPage.webTitle, seoData.webTitle)
  override lazy val title: String = seoData.title.getOrElse(webTitle)

  override lazy val metaData: Map[String, Any] = super.metaData ++ faciaPageMetaData + ("newSeo" -> isNewSeoOn.toString)

  lazy val faciaPageMetaData: Map[String, Any] = oldOrNewSeo(frontPage.metaData, newMetaData)
  lazy val newMetaData: Map[String, Any] = Map(
    "keywords" -> webTitle.capitalize,
    "content-type" -> contentType,
    "is-front" -> true
  )

  lazy val contentType: String = if (Edition.all.exists(edition => id.endsWith(edition.id))) "Network Front" else "Section"
}
