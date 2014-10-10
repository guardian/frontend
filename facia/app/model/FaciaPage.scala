package model

import common.{NavItem, Edition}
import conf.Configuration
import dfp.DfpAgent
import play.api.libs.json.{JsString, JsValue}
import services.CollectionConfigWithId

case class FaciaPage(id: String,
                     seoData: SeoData,
                     frontProperties: FrontProperties,
                     collections: List[(CollectionConfigWithId, Collection)]) extends MetaData with AdSuffixHandlingForFronts {

  override lazy val description: Option[String] = seoData.description
  override lazy val section: String = seoData.navSection
  lazy val navSection: String = section
  override lazy val analyticsName: String = s"GFE:${seoData.webTitle.capitalize}"
  override lazy val webTitle: String = seoData.webTitle
  override lazy val title: Option[String] = seoData.title

  override lazy val isFront = true

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ faciaPageMetaData
  lazy val faciaPageMetaData: Map[String, JsValue] = Map(
    "keywords" -> JsString(webTitle.capitalize),
    "contentType" -> JsString(contentType)
  )

  val isNetworkFront: Boolean = Edition.all.exists(edition => id.toLowerCase.endsWith(edition.id.toLowerCase))

  override lazy val contentType: String = if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section

  override lazy val isSponsored = DfpAgent.isSponsored(id, Some(section))
  override def hasMultipleSponsors = false // Todo: need to think about this
  override lazy val isAdvertisementFeature = DfpAgent.isAdvertisementFeature(id, Some(section))
  override def hasMultipleFeatureAdvertisers = false // Todo: need to think about this
  override lazy val isFoundationSupported = DfpAgent.isFoundationSupported(id, Some(section))
  override def sponsor = DfpAgent.getSponsor(id)
  override def hasPageSkin(edition: Edition) = DfpAgent.isPageSkinned(adUnitSuffix, edition)

  def allItems = collections.map(_._2).flatMap(_.items).distinct

  override def openGraph: Map[String, String] = super.openGraph ++ Map(
    "og:image" -> Configuration.facebook.imageFallback) ++
    optionalMapEntry("og:description", description)  ++
    optionalMapEntry("og:image", frontProperties.imageUrl)


  override def cards: List[(String, String)] = super.cards ++
    List("twitter:card" -> "summary")

  override def customSignPosting: Option[NavItem] = FaciaSignpostingOverrides(id)

  private def optionalMapEntry(key:String, o: Option[String]): Map[String, String] =
    o.map(value => Map(key -> value)).getOrElse(Map())
}

object FaciaPage {
  def defaultFaciaPage: FaciaPage = FaciaPage("", SeoData.empty, FrontProperties.empty, Nil)
}
