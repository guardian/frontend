package model

import common.{Edition, NavItem}
import conf.Configuration
import contentapi.Paths
import dfp.DfpAgent
import layout.{CollectionEssentials, Front}
import play.api.libs.json.{JsString, JsValue}
import services.CollectionConfigWithId

import scala.language.postfixOps

case class FaciaPage(id: String,
                     seoData: SeoData,
                     frontProperties: FrontProperties,
                     collections: List[(CollectionConfigWithId, Collection)])
  extends MetaData
  with AdSuffixHandlingForFronts
  with KeywordSponsorshipHandling {

  /** If a Facia front is a tag or section page, it ought to exist as a tag or section ID for one of its pieces of
    * content.
    *
    * There are fronts that exist in Facia but have no equivalent tag or section page, which is why we need to make
    * this check.
    */
  def allPath: Option[String] = {
    val tagAndSectionIds = for {
      (_, collection) <- collections
      item <- collection.items
      id <- item.section +: item.tags.map(_.id)
    } yield id

    val validIds = Set(
      Some(id),
      Paths.withoutEdition(id)
    ).flatten

    tagAndSectionIds.find(validIds contains) map { id =>
      s"/${Paths.withoutEdition(id).getOrElse(id)}/all"
    }
  }

  lazy val front = Front.fromConfigs(collections map { case (config, collection) =>
    (config, CollectionEssentials.fromCollection(collection))
  })

  override lazy val description: Option[String] = seoData.description
  override lazy val section: String = seoData.navSection
  lazy val navSection: String = section
  override lazy val analyticsName: String = s"GFE:${seoData.webTitle.capitalize}"
  override lazy val webTitle: String = seoData.webTitle
  override lazy val title: Option[String] = seoData.title

  lazy val keywordIds: Seq[String] = frontKeywordIds(id)

  override lazy val isFront = true

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ faciaPageMetaData
  lazy val faciaPageMetaData: Map[String, JsValue] = Map(
    "keywords" -> JsString(webTitle.capitalize),
    "keywordIds" -> JsString(keywordIds.mkString(",")),
    "contentType" -> JsString(contentType)
  )

  val isNetworkFront: Boolean = Edition.all.exists(_.id.toLowerCase == id)

  override lazy val contentType: String = if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section

  override def isSponsored(maybeEdition: Option[Edition] = None): Boolean =
    keywordIds exists (DfpAgent.isSponsored(_, Some(section), maybeEdition))
  override lazy val isAdvertisementFeature = keywordIds exists (DfpAgent.isAdvertisementFeature(_,
      Some(section)))
  override lazy val isFoundationSupported = keywordIds exists (DfpAgent.isFoundationSupported(_,
      Some(section)))
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
