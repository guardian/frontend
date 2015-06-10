package model

import com.gu.facia.api.models._
import common.{Edition, NavItem}
import conf.Configuration
import contentapi.Paths
import dfp.DfpAgent
import layout.Front
import model.facia.PressedCollection
import org.joda.time.DateTime
import play.api.libs.json.{Json, JsString, JsValue}
import services.FaciaContentConvert

import scala.language.postfixOps

object PressedPage {
  def fromFaciaPage(faciaPage: FaciaPage): PressedPage =
    PressedPage(
      faciaPage.id,
      faciaPage.seoData,
      faciaPage.frontProperties,
      faciaPage.collections.map{ case (collectionConfigWithId, collection) =>
        PressedCollection(
          collectionConfigWithId.id,
          collectionConfigWithId.config.displayName.getOrElse(""),
          collection.curated.map(FaciaContentConvert.frontentContentToFaciaContent(_, Option(collectionConfigWithId.config))).toList,
          (collection.editorsPicks ++ collection.mostViewed ++ collection.results).map(FaciaContentConvert.frontentContentToFaciaContent(_, Option(collectionConfigWithId.config))).toList,
          collection.treats.map(FaciaContentConvert.frontentContentToFaciaContent(_, Option(collectionConfigWithId.config))).toList,
          collection.lastUpdated.map(new DateTime(_)),
          collection.updatedBy,
          collection.updatedEmail,
          collection.href,
          collectionConfigWithId.config.apiQuery,
          collectionConfigWithId.config.collectionType,
          collectionConfigWithId.config.groups.map(Group.fromGroups),
          collectionConfigWithId.config.uneditable,
          collectionConfigWithId.config.showTags,
          collectionConfigWithId.config.showSections,
          collectionConfigWithId.config.hideKickers,
          collectionConfigWithId.config.showDateHeader,
          collectionConfigWithId.config.showLatestUpdate,
          collectionConfigWithId.config
        )
      }
    )

  implicit val pressedPageFormat = Json.format[PressedPage]
}

case class PressedPage(id: String,
                     seoData: SeoData,
                     frontProperties: FrontProperties,
                     collections: List[PressedCollection]) extends MetaData with AdSuffixHandlingForFronts {
  /** If a Facia front is a tag or section page, it ought to exist as a tag or section ID for one of its pieces of
    * content.
    *
    * There are fronts that exist in Facia but have no equivalent tag or section page, which is why we need to make
    * this check.
    */
  def allPath: Option[String] = {
    val tagAndSectionIds = for {
      pressedCollection <- collections
      item <- pressedCollection.all
      id <- {item match {
              case curatedContent: CuratedContent =>
                curatedContent.content.sectionId ++ curatedContent.content.tags.map(_.id)
              case _ => Nil
            }}
    } yield id

    val validIds = Set(
      Some(id),
      Paths.withoutEdition(id)
    ).flatten

    tagAndSectionIds.find(validIds contains) map { id =>
      s"/${Paths.withoutEdition(id).getOrElse(id)}/all"
    }
  }

  override lazy val description: Option[String] = seoData.description
  override lazy val section: String = seoData.navSection
  lazy val navSection: String = section

  //For network fronts we want the string "Network Front"
  //This allows us to change webTitle in tool easily on fronts
  override lazy val analyticsName: String =
    if (isNetworkFront)
      s"GFE:${GuardianContentTypes.NetworkFront}"
    else
      s"GFE:${seoData.webTitle.capitalize}"

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
  override def hasMultipleSponsors = false // Todo: need to think about this
  override lazy val isAdvertisementFeature = keywordIds exists (DfpAgent.isAdvertisementFeature(_,
      Some(section)))
  override def hasMultipleFeatureAdvertisers = false // Todo: need to think about this
  override lazy val isFoundationSupported = keywordIds exists (DfpAgent.isFoundationSupported(_,
      Some(section)))
  override def sponsor = keywordIds.flatMap(DfpAgent.getSponsor(_)).headOption
  override def hasPageSkin(edition: Edition) = DfpAgent.isPageSkinned(adUnitSuffix, edition)

  def allItems = collections.flatMap(_.all).distinct

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
