package model

import commercial.campaigns.PersonalInvestmentsCampaign
import com.gu.commercial.branding.Branding
import com.gu.facia.api.models._
import common.Edition
import conf.Configuration
import contentapi.Paths
import model.facia.PressedCollection
import model.pressed.PressedContent
import play.api.libs.json.{JsBoolean, JsString, JsValue}

import scala.language.postfixOps

object PressedPage {

  implicit val pressedPageFormat = PressedPageFormat.format

  def makeMetadata(id: String, seoData: SeoData, frontProperties: FrontProperties, collections: List[PressedCollection]): MetaData = {
    def optionalMapEntry(key:String, o: Option[String]): Map[String, String] =
      o.map(value => Map(key -> value)).getOrElse(Map())

    val isNetworkFront: Boolean = Edition.all.exists(_.networkFrontId == id)
    val keywordIds: Seq[String] = frontKeywordIds(id)
    val contentType = if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section

    val faciaPageMetaData: Map[String, JsValue] = Map(
      "keywords" -> JsString(seoData.webTitle.capitalize),
      "keywordIds" -> JsString(keywordIds.mkString(",")),
      "hasSuperStickyBanner" -> JsBoolean(PersonalInvestmentsCampaign.isRunning(keywordIds)),
      "isPaidContent" -> JsBoolean(frontProperties.isPaidContent)
    )

    val openGraph: Map[String, String] = Map(
      "og:image" -> Configuration.images.fallbackLogo) ++
      optionalMapEntry("og:description", seoData.description)  ++
      optionalMapEntry("og:image", frontProperties.imageUrl)

    val twitterProperties: Map[String, String] = Map("twitter:card" -> "summary")

    MetaData.make(
      id = id,
      section = Some(SectionSummary.fromId(seoData.navSection)),
      webTitle = seoData.webTitle,
      //For network fronts we want the string "Network Front"
      //This allows us to change webTitle in tool easily on fronts
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
      twitterPropertiesOverrides = twitterProperties,
      commercial = frontProperties.commercial
    )
  }
}

case class PressedPage (
  id: String,
  seoData: SeoData,
  frontProperties: FrontProperties,
  collections: List[PressedCollection]) extends StandalonePage {

  override val metadata: MetaData = PressedPage.makeMetadata(id, seoData, frontProperties, collections)
  val isNetworkFront: Boolean = Edition.all.exists(_.networkFrontId == id)

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

    tagAndSectionIds.find(validIds contains).map { id =>
      s"/${Paths.withoutEdition(id).getOrElse(id)}/all"
    }.orElse(allPathFromTreats)
  }

  private def allPathFromTreats: Option[String] = {
    collections.flatMap(_.treats.collect {
        case treat if SupportedUrl.fromFaciaContent(treat).endsWith("/all") => SupportedUrl.fromFaciaContent(treat)
      }
    ).headOption
  }

  private def branding(edition: Edition): Option[Branding] = metadata.commercial.flatMap(_.branding(edition))

  val navSection: String = metadata.sectionId

  val keywordIds: Seq[String] = frontKeywordIds(id)

  def allItems: List[PressedContent] = collections.flatMap(_.curatedPlusBackfillDeduplicated).distinct

  def isBranded(edition: Edition): Boolean = branding(edition).isDefined

  def isSponsored(edition: Edition): Boolean = branding(edition).exists(_.isSponsored)

  def isPaid(edition: Edition): Boolean = branding(edition).exists(_.isPaid)

}
