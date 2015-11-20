package model

import com.gu.facia.api.models._
import common.dfp.{AdSize, AdSlot, DfpAgent}
import common.Edition
import conf.Configuration
import conf.Configuration.commercial.showMpuInAllContainersPageId
import contentapi.Paths
import model.facia.PressedCollection
import play.api.libs.json.{JsBoolean, JsString, JsValue, Json}

import scala.language.postfixOps

object PressedPage {
  implicit val pressedPageFormat = Json.format[PressedPage]
}

case class PressedPage(
  id: String,
  seoData: SeoData,
  frontProperties: FrontProperties,
  collections: List[PressedCollection]) extends Page {

  val isNetworkFront: Boolean = Edition.all.exists(_.id.toLowerCase == id)

  override val metadata: MetaData = MetaData.make(
    id = id,
    section = seoData.navSection,
    webTitle = seoData.webTitle,
    //For network fronts we want the string "Network Front"
    //This allows us to change webTitle in tool easily on fronts
    analyticsName = if (isNetworkFront)
        s"GFE:${GuardianContentTypes.NetworkFront}"
      else
        s"GFE:${seoData.webTitle.capitalize}",
    description = seoData.description,
    isFront = true,
    title = seoData.title,
    contentType = if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section,
    adUnitSuffix = Some(AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(id, seoData.navSection)),
    customSignPosting = FaciaSignpostingOverrides(id),
    iosType = Some("front")
  )

  /** If a Facia front is a tag or section page, it ought to exist as a tag or section ID for one of its pieces of
    * content.
    *
    * There are fronts that exist in Facia but have no equivalent tag or section page, which is why we need to make
    * this check.
    */
  def allPath: Option[String] = {
    val tagAndSectionIds = for {
      pressedCollection <- collections
      item <- pressedCollection.curatedPlusBackfillDeduplicated
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
  val navSection: String = metadata.section
  val keywordIds: Seq[String] = frontKeywordIds(id)
  val showMpuInAllContainers: Boolean = showMpuInAllContainersPageId contains id

  def getJavascriptConfig: Map[String, JsValue] = metadata.javascriptConfig ++ faciaPageMetaData
  val faciaPageMetaData: Map[String, JsValue] = Map(
    "keywords" -> JsString(metadata.webTitle.capitalize),
    "keywordIds" -> JsString(keywordIds.mkString(",")),
    "contentType" -> JsString(metadata.contentType)
  ) ++ (if (showMpuInAllContainers) Map("showMpuInAllContainers" -> JsBoolean(true)) else Nil)

  def isSponsored(maybeEdition: Option[Edition] = None): Boolean =
    keywordIds exists (DfpAgent.isSponsored(_, Some(metadata.section), maybeEdition))
  def hasMultipleSponsors = false // Todo: need to think about this
  val isAdvertisementFeature = keywordIds exists (DfpAgent.isAdvertisementFeature(_,
      Some(metadata.section)))
  def hasMultipleFeatureAdvertisers = false // Todo: need to think about this
  val isFoundationSupported = keywordIds exists (DfpAgent.isFoundationSupported(_,
      Some(metadata.section)))
  def sponsor = keywordIds.flatMap(DfpAgent.getSponsor(_)).headOption
  def hasPageSkin(edition: Edition) = DfpAgent.isPageSkinned(metadata.adUnitSuffix, edition)

  def sizeOfTakeoverAdsInSlot(slot: AdSlot, edition: Edition): Seq[AdSize] = {
    DfpAgent.sizeOfTakeoverAdsInSlot(slot, metadata.adUnitSuffix, edition)
  }

  def hasAdInBelowTopNavSlot(edition: Edition): Boolean = {
    DfpAgent.hasAdInTopBelowNavSlot(metadata.adUnitSuffix, edition)
  }
  def omitMPUsFromContainers(edition: Edition): Boolean = {
    DfpAgent.omitMPUsFromContainers(id, edition)
  }



  def allItems = collections.flatMap(_.curatedPlusBackfillDeduplicated).distinct

  def getOpenGraph: Map[String, String] = metadata.getOpengraphProperties ++ Map(
    "og:image" -> Configuration.facebook.imageFallback) ++
    optionalMapEntry("og:description", metadata.description)  ++
    optionalMapEntry("og:image", frontProperties.imageUrl)


  def getTwitterProperties: Map[String, String]  = metadata.getTwitterProperties ++ Map(
    "twitter:card" -> "summary")


  private def optionalMapEntry(key:String, o: Option[String]): Map[String, String] =
    o.map(value => Map(key -> value)).getOrElse(Map())

}
