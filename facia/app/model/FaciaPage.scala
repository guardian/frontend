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
  def oldOrNewSeo[T](oldValue: T, newValue: T): T = if (isNewSeoOn) newValue else oldValue

  override lazy val description: Option[String] = oldOrNewSeo(frontPage.description, seoData.description)
  override lazy val section: String = oldOrNewSeo(frontPage.section, seoData.section.get)
  override lazy val analyticsName: String = oldOrNewSeo(frontPage.analyticsName, s"GFE:$getContentType")
  override lazy val webTitle: String = oldOrNewSeo(frontPage.webTitle, seoData.webTitle.get)

  override lazy val metaData: Map[String, Any] = super.metaData + ("newSeo" -> isNewSeoOn.toString)

  lazy val getContentType: String =
    Edition.all.find(edition => id.endsWith(edition.id)) match {
      case Some(_) => "Network Front"
      case None    => "Section"
    }
}
