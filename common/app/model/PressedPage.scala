package model

import com.gu.commercial.branding.Branding
import common.Edition
import conf.Configuration
import contentapi.Paths
import model.facia.PressedCollection
import model.pressed.PressedContent
import navigation.GuardianFoundationHelper
import play.api.libs.json.{JsBoolean, JsString, JsValue, OFormat}

import scala.language.postfixOps

object PressedPage {

  implicit val pressedPageFormat: OFormat[PressedPage] = PressedPageFormat.format

  def makeMetadata(
      id: String,
      seoData: SeoData,
      frontProperties: FrontProperties,
      collections: List[PressedCollection],
  ): MetaData = {
    def optionalMapEntry(key: String, o: Option[String]): Map[String, String] =
      o.map(value => Map(key -> value)).getOrElse(Map())

    val isNetworkFront: Boolean = Edition.allEditions.exists(_.networkFrontId == id)
    val keywordIds: Seq[String] = frontKeywordIds(id)
    val contentType: DotcomContentType =
      if (isNetworkFront) DotcomContentType.NetworkFront else DotcomContentType.Section

    val faciaPageMetaData: Map[String, JsValue] = Map(
      "keywords" -> JsString(seoData.webTitle.capitalize),
      "keywordIds" -> JsString(keywordIds.mkString(",")),
      "isPaidContent" -> JsBoolean(frontProperties.isPaidContent),
    )

    val openGraph: Map[String, String] = Map("og:image" -> Configuration.images.fallbackLogo) ++
      optionalMapEntry("og:description", seoData.description) ++
      optionalMapEntry("og:image", frontProperties.imageUrl)

    val twitterProperties: Map[String, String] = Map("twitter:card" -> "summary")

    MetaData.make(
      id = id,
      section = Some(SectionId.fromId(seoData.navSection)),
      webTitle = seoData.webTitle,
      // For network fronts we want the string "Network Front"
      // This allows us to change webTitle in tool easily on fronts
      description = seoData.description,
      isFront = true,
      isPressedPage = true,
      title = seoData.title,
      contentType = Some(contentType),
      adUnitSuffix = Some(AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(id, seoData.navSection)),
      customSignPosting = FaciaSignpostingOverrides(id),
      iosType = Some("front"),
      javascriptConfigOverrides = faciaPageMetaData,
      opengraphPropertiesOverrides = openGraph,
      twitterPropertiesOverrides = twitterProperties,
      commercial = frontProperties.commercial,
      isFoundation = GuardianFoundationHelper.sectionIdIsGuardianFoundation(id),
    )
  }
}

sealed trait PressedPageType {
  def suffix: String
}

case object FullType extends PressedPageType {
  override def suffix = ""
}

case object LiteType extends PressedPageType {
  override def suffix = ".lite"
}

case object FullAdFreeType extends PressedPageType {
  override def suffix = ".adfree"
}

case object LiteAdFreeType extends PressedPageType {
  override def suffix = ".lite.adfree"
}

case class PressedCollectionVersions(
    lite: PressedCollection,
    full: PressedCollection,
    liteAdFree: PressedCollection,
    fullAdFree: PressedCollection,
)

case class PressedPageVersions(lite: PressedPage, full: PressedPage, liteAdFree: PressedPage, fullAdFree: PressedPage)

object PressedPageVersions {
  def fromPressedCollections(
      id: String,
      seoData: SeoData,
      frontProperties: FrontProperties,
      pressedCollections: List[PressedCollectionVersions],
  ): PressedPageVersions = {
    PressedPageVersions(
      PressedPage(id, seoData, frontProperties, pressedCollections.map(_.lite)).filterEmpty,
      PressedPage(id, seoData, frontProperties, pressedCollections.map(_.full)).filterEmpty,
      PressedPage(id, seoData, frontProperties, pressedCollections.map(_.liteAdFree)).filterEmpty,
      PressedPage(id, seoData, frontProperties, pressedCollections.map(_.fullAdFree)).filterEmpty,
    )
  }
}

case class PressedPage(
    id: String,
    seoData: SeoData,
    frontProperties: FrontProperties,
    collections: List[PressedCollection],
) extends StandalonePage {

  lazy val filterEmpty: PressedPage = copy(collections = collections.filterNot(_.isEmpty))

  override val metadata: MetaData = PressedPage.makeMetadata(id, seoData, frontProperties, collections)
  val isNetworkFront: Boolean = Edition.allEditions.exists(_.networkFrontId == id)

  /** If a Facia front is a tag or section page, it ought to exist as a tag or section ID for one of its pieces of
    * content.
    *
    * There are fronts that exist in Facia but have no equivalent tag or section page, which is why we need to make this
    * check.
    */
  def allPath: Option[String] = {
    val tagAndSectionIds = for {
      pressedCollection <- collections
      item <- pressedCollection.curatedPlusBackfillDeduplicated
      id <- {
        item match {
          case curatedContent: pressed.CuratedContent =>
            curatedContent.properties.maybeContent
              .map(content => content.metadata.sectionId.map(_.value) ++ content.tags.tags.map(_.id))
              .getOrElse(Nil)
          case _ => Nil
        }
      }
    } yield id

    val validIds = Set(
      Some(id),
      Paths.withoutEdition(id),
    ).flatten

    tagAndSectionIds
      .find(validIds contains)
      .map { id =>
        s"/${Paths.withoutEdition(id).getOrElse(id)}/all"
      }
      .orElse(allPathFromTreats)
  }

  private def allPathFromTreats: Option[String] = {
    collections
      .flatMap(_.treats.collect {
        case treat if SupportedUrl.fromFaciaContent(treat).endsWith("/all") => SupportedUrl.fromFaciaContent(treat)
      })
      .headOption
  }

  private def branding(edition: Edition): Option[Branding] = metadata.commercial.flatMap(_.branding(edition))

  val navSection: String = metadata.sectionId

  val keywordIds: Seq[String] = frontKeywordIds(id)

  def allItems: List[PressedContent] = collections.flatMap(_.curatedPlusBackfillDeduplicated).distinct

  def isBranded(edition: Edition): Boolean = branding(edition).isDefined

  def isSponsored(edition: Edition): Boolean = branding(edition).exists(_.isSponsored)

  def isPaid(edition: Edition): Boolean = branding(edition).exists(_.isPaid)

}
