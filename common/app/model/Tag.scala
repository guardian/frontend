package model

import com.gu.contentapi.client.model.{Tag => ApiTag, Podcast}
import common.{Pagination, Reference}
import conf.Configuration
import contentapi.SectionTagLookUp
import play.api.libs.json.{JsArray, JsString, JsValue}
import views.support.{Contributor, ImgSrc, Item140}

object Tag {
  def make(tag: ApiTag, pagination: Option[Pagination] = None): Tag = {
    val section = tag.sectionId.getOrElse("global")
    val webTitle = tag.webTitle
    val isFootballTeam = tag.references.exists(_.`type` == "pa-football-team")
    val isFootballCompetition = tag.references.exists(_.`type` == "pa-football-competition")
    val footballBadgeUrl = tag.references.find(_.`type` == "pa-football-team")
      .map(_.id.split("/").drop(1).mkString("/"))
      .map(teamId => s"${Configuration.staticSport.path}/football/crests/120/$teamId.png")
    val richLinkId = tag.references.find(_.`type` == "rich-link")
      .map(_.id.stripPrefix("rich-link/"))
      .filter(_.matches("""https?://www\.theguardian\.com/.*"""))
    val openModuleId = tag.references.find(_.`type` == "open-module")
      .map(_.id.stripPrefix("open-module/"))
      .filter(_.matches("""https?://open-module\.appspot\.com/view\?id=\d+"""))

    val javascriptConfigOverrides: Map[String, JsValue] = Map(
      ("keywords", JsString(tag.webTitle)),
      ("keywordIds", JsString(tag.id)),
      ("contentType", JsString("Tag")),
      ("references", JsArray(tag.references.toSeq.map(ref => Reference.toJavaScript(ref.id))))
    )
    val openGraphDescription: Option[String] = tag.bio.orElse(tag.description)
    val openGraphImage = tag.bylineImageUrl.map(ImgSrc(_, Item140)).map { s: String => if (s.startsWith("//")) s"http:$s" else s}
      .orElse(footballBadgeUrl)

    def optionalMapEntry(key:String, o: Option[String]): Map[String, String] =
      o.map(value => Map(key -> value)).getOrElse(Map())

    val openGraphPropertiesOverrides: Map[String, String] =
      optionalMapEntry("og:description", openGraphDescription) ++
      optionalMapEntry("og:image", openGraphImage)

    val metadata = MetaData (
      id = tag.id,
      webUrl = tag.webUrl,
      url = SupportedUrl(tag),
      section = section,
      webTitle = tag.webTitle,
      analyticsName = s"GFE:$section:$webTitle",
      adUnitSuffix = AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(tag.id, section),
      description = tag.description,
      pagination = pagination,
      isFront = true,
      rssPath = Some(s"/id/rss"),
      iosType = section match {
        case "crosswords" => None
        case _ => Some("list")
      },
      javascriptConfigOverrides = javascriptConfigOverrides,
      opengraphPropertiesOverrides = openGraphPropertiesOverrides,
      twitterPropertiesOverrides = Map("twitter:card" -> "summary")
    )

    Tag(
      metadata,
      tagType = tag.`type`,
      sectionName = tag.sectionName.getOrElse("global"),
      twitterHandle = tag.twitterHandle,
      emailAddress = tag.emailAddress,
      contributorImagePath = tag.bylineImageUrl.map(ImgSrc(_, Contributor)),
      openGraphImage = openGraphImage,
      openGraphDescription = openGraphDescription,
      contributorLargeImagePath = tag.bylineLargeImageUrl,
      isFootballTeam = isFootballTeam,
      isFootballCompetition = isFootballCompetition,
      footballBadgeUrl = footballBadgeUrl,
      bio = tag.bio.getOrElse(""),
      richLinkId = richLinkId,
      openModuleId = openModuleId,
      podcast = tag.podcast
    )
  }
}

case class Tag private (
  override val metadata: MetaData,
  tagType: String,
  sectionName: String,
  twitterHandle: Option[String],
  emailAddress: Option[String],
  contributorImagePath: Option[String],
  openGraphImage: Option[String],
  openGraphDescription: Option[String],
  contributorLargeImagePath: Option[String],
  isFootballTeam: Boolean,
  isFootballCompetition: Boolean,
  footballBadgeUrl: Option[String],
  bio: String,
  richLinkId: Option[String],
  openModuleId: Option[String],
  podcast: Option[Podcast] // TODO Should not be a capi class.
) extends StandalonePage {

  lazy val isContributor: Boolean = metadata.id.startsWith("profile/")

  val id: String = metadata.id
  val name: String = metadata.webTitle
  val isSeries: Boolean = tagType == "series"
  val isBlog: Boolean = tagType == "blog"
  val isSectionTag: Boolean = SectionTagLookUp.sectionId(metadata.id).contains(metadata.section)
  val showSeriesInMeta = metadata.id != "childrens-books-site/childrens-books-site"
  val isKeyword = tagType == "keyword"
  val tagWithoutSection = metadata.id.split("/")(1) // used for football nav
}
