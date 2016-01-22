package model

import com.gu.facia.api.models._
import common.Edition
import common.dfp.DfpAgent
import conf.Configuration
import conf.Configuration.commercial.showMpuInAllContainersPageId
import contentapi.Paths
import model.facia.PressedCollection
import play.api.libs.json.{JsBoolean, JsString, JsValue}

import scala.language.postfixOps

object PressedPage {

  implicit val pressedPageFormat = PressedPageFormat.format

  def makeMetadata(id: String, seoData: SeoData, frontProperties: FrontProperties, collections: List[PressedCollection]): MetaData = {
    def optionalMapEntry(key:String, o: Option[String]): Map[String, String] =
      o.map(value => Map(key -> value)).getOrElse(Map())

    val isNetworkFront: Boolean = Edition.all.exists(_.networkFrontId.toLowerCase == id)
    val showMpuInAllContainers: Boolean = showMpuInAllContainersPageId contains id
    val keywordIds: Seq[String] = frontKeywordIds(id)
    val contentType = if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section

    val faciaPageMetaData: Map[String, JsValue] = Map(
      "keywords" -> JsString(seoData.webTitle.capitalize),
      "keywordIds" -> JsString(keywordIds.mkString(",")),
      "contentType" -> JsString(contentType)
    ) ++ (if (showMpuInAllContainers) Map("showMpuInAllContainers" -> JsBoolean(true)) else Nil)

    val openGraph: Map[String, String] = Map(
      "og:image" -> Configuration.images.fallbackLogo) ++
      optionalMapEntry("og:description", seoData.description)  ++
      optionalMapEntry("og:image", frontProperties.imageUrl)

    val twitterProperties: Map[String, String] = Map("twitter:card" -> "summary")

    MetaData.make(
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
      isPressedPage = true,
      title = seoData.title,
      contentType = contentType,
      adUnitSuffix = Some(AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(id, seoData.navSection)),
      customSignPosting = FaciaSignpostingOverrides(id),
      iosType = Some("front"),
      javascriptConfigOverrides = faciaPageMetaData,
      opengraphPropertiesOverrides = openGraph,
      twitterPropertiesOverrides = twitterProperties
    )
  }
}

case class PressedPage (
  id: String,
  seoData: SeoData,
  frontProperties: FrontProperties,
  collections: List[PressedCollection]) extends StandalonePage {

  override val metadata: MetaData = PressedPage.makeMetadata(id, seoData, frontProperties, collections)

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

   def sponsorshipType: Option[String] = {
    if (isSponsored(None)) {
      Option("sponsoredfeatures")
    } else if (isAdvertisementFeature) {
      Option("advertisement-features")
    } else if (isFoundationSupported) {
      Option("foundation-features")
    } else {
      None
    }
  }

  def isSponsored(maybeEdition: Option[Edition] = None): Boolean =
    keywordIds exists (DfpAgent.isSponsored(_, Some(metadata.section), maybeEdition))
  def hasMultipleSponsors = false // Todo: need to think about this
  lazy val isAdvertisementFeature = keywordIds exists (DfpAgent.isAdvertisementFeature(_,
      Some(metadata.section)))
  def hasMultipleFeatureAdvertisers = false // Todo: need to think about this
  lazy val isFoundationSupported = keywordIds exists (DfpAgent.isFoundationSupported(_,
      Some(metadata.section)))
  lazy val sponsor = keywordIds.flatMap(DfpAgent.getSponsor(_)).headOption

  def allItems = collections.flatMap(_.curatedPlusBackfillDeduplicated).distinct
}
