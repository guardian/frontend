package model

import common.Edition
import dfp.DfpAgent

case class FaciaPage(
                      id: String,
                      seoData: SeoData,
                      collections: List[(Config, Collection)]) extends MetaData {

  override lazy val description: Option[String] = seoData.description
  override lazy val section: String = seoData.section
  override lazy val analyticsName: String = s"GFE:${seoData.webTitle.capitalize}"
  override lazy val webTitle: String = seoData.webTitle
  override lazy val title: Option[String] = seoData.title

  override lazy val metaData: Map[String, Any] = super.metaData ++ faciaPageMetaData

  lazy val faciaPageMetaData: Map[String, Any] = newMetaData
  lazy val newMetaData: Map[String, Any] = Map(
    "keywords" -> webTitle.capitalize,
    "content-type" -> contentType,
    "is-front" -> true
  )

  lazy val contentType: String = if (Edition.all.exists(edition => id.toLowerCase.endsWith(edition.id.toLowerCase))) "Network Front" else "Section"

  override def isSponsored = DfpAgent.isSponsored(id)
  override def isAdvertisementFeature = DfpAgent.isAdvertisementFeature(id)
}

object FaciaPage {
  def defaultFaciaPage: FaciaPage = FaciaPage("", SeoData.empty, Nil)
}