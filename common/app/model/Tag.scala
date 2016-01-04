package model

import com.gu.contentapi.client.model.v1.{Tag => ApiTag, Podcast => ApiPodcast, Reference => ApiReference}
import common.{RelativePathEscaper, Pagination}
import conf.Configuration
import contentapi.SectionTagLookUp
import play.api.libs.json.{JsObject, JsArray, JsString, JsValue}
import views.support.{Contributor, ImgSrc, Item140}

object Tag {

  def makeMetadata(tag: TagProperties, pagination: Option[Pagination]): MetaData = {

    val javascriptConfigOverrides: Map[String, JsValue] = Map(
      ("keywords", JsString(tag.webTitle)),
      ("keywordIds", JsString(tag.id)),
      ("contentType", JsString("Tag")),
      ("references", JsArray(tag.references.map(ref => Reference.toJavaScript(ref.id))))
    )

    def optionalMapEntry(key: String, o: Option[String]): Map[String, String] =
      o.map(value => Map(key -> value)).getOrElse(Map())

    val openGraphDescription: Option[String] = tag.bio.orElse(tag.description)
    val openGraphImage = tag.bylineImageUrl.map(ImgSrc(_, Item140)).map { s: String => if (s.startsWith("//")) s"http:$s" else s }
      .orElse(tag.footballBadgeUrl)

    val openGraphPropertiesOverrides: Map[String, String] =
      optionalMapEntry("og:description", openGraphDescription) ++
        optionalMapEntry("og:image", openGraphImage)

    MetaData(
      id = tag.id,
      webUrl = tag.webUrl,
      webTitle = tag.webTitle,
      url = tag.url,
      section = tag.sectionId,
      analyticsName = s"GFE:${tag.sectionId}:${tag.webTitle}",
      adUnitSuffix = AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(tag.id, tag.sectionId),
      description = tag.description,
      pagination = pagination,
      isFront = true,
      rssPath = Some(s"/id/rss"),
      iosType = tag.sectionId match {
        case "crosswords" => None
        case _ => Some("list")
      },
      javascriptConfigOverrides = javascriptConfigOverrides,
      opengraphPropertiesOverrides = openGraphPropertiesOverrides,
      twitterPropertiesOverrides = Map("twitter:card" -> "summary")
    )
  }

  def make(tag: ApiTag, pagination: Option[Pagination] = None): Tag = {

    val richLinkId = tag.references.find(_.`type` == "rich-link")
      .map(_.id.stripPrefix("rich-link/"))
      .filter(_.matches( """https?://www\.theguardian\.com/.*"""))
    val openModuleId = tag.references.find(_.`type` == "open-module")
      .map(_.id.stripPrefix("open-module/"))
      .filter(_.matches( """https?://open-module\.appspot\.com/view\?id=\d+"""))

    Tag(
      properties = TagProperties.make(tag),
      pagination = pagination,
      richLinkId = richLinkId,
      openModuleId = openModuleId
    )
  }
}

object Podcast {
  def make(podcast: ApiPodcast): Podcast = {
    Podcast(podcast.subscriptionUrl)
  }
}
case class Podcast(
  subscriptionUrl: Option[String]
)

object Reference {
  def make(reference: ApiReference): Reference = {
    Reference(
      id = reference.id,
      `type` = reference.`type`
    )
  }

  def split(s: String) = {
    val parts = s.split("/")
    parts(0) -> parts.drop(1).mkString("/")
  }

  def toJavaScript(s: String) = {
    val (k, v) = split(s)

    /** Yeah ... so ... in the JavaScript references are represented like this:
      *
      * "references":[{"esaFootballTeam":"/football/team/48"},{"optaFootballTournament":"5/2012"}57"} ... ]
      *
      * See for example the source of
      * http://www.theguardian.com/football/live/2014/aug/20/maribor-v-celtic-champions-league-play-off-live-report
      *
      * Seems pretty STRANGE.
      *
      * TODO: figure out if this is actually being used. If so, refactor it.
      */
    JsObject(Seq(k -> JsString(RelativePathEscaper.escapeLeadingSlashFootballPaths(v))))
  }
}

case class Reference(
  id: String,
  `type`: String
)

object TagProperties {
  def make(tag: ApiTag): TagProperties = {

    TagProperties(
      id = tag.id,
      url = SupportedUrl(tag),
      tagType = tag.`type`.name,
      sectionId = tag.sectionId.getOrElse("global"),
      sectionName = tag.sectionName.getOrElse("global"),
      webTitle = tag.webTitle,
      webUrl = tag.webUrl,
      twitterHandle = tag.twitterHandle,
      bio = tag.bio,
      description = tag.description,
      emailAddress = tag.emailAddress,
      contributorLargeImagePath = tag.bylineLargeImageUrl,
      bylineImageUrl = tag.bylineImageUrl,
      podcast = tag.podcast.map(Podcast.make),
      references = tag.references.map(Reference.make)
    )
  }
}

case class TagProperties(
  id: String,
  url: String,
  tagType: String,
  sectionId: String,
  sectionName: String,
  webTitle: String,
  webUrl: String,
  twitterHandle: Option[String],
  bio: Option[String],
  description: Option[String],
  emailAddress: Option[String],
  contributorLargeImagePath: Option[String],
  bylineImageUrl: Option[String],
  podcast: Option[Podcast],
  references: Seq[Reference]
) {
 val footballBadgeUrl = references.find(_.`type` == "pa-football-team")
      .map(_.id.split("/").drop(1).mkString("/"))
      .map(teamId => s"${Configuration.staticSport.path}/football/crests/120/$teamId.png")
}

case class Tag (
  properties: TagProperties,
  pagination: Option[Pagination],
  richLinkId: Option[String],
  openModuleId: Option[String]

) extends StandalonePage {

  override val metadata: MetaData = Tag.makeMetadata(properties, pagination)

  val isContributor: Boolean = metadata.id.startsWith("profile/")
  val id: String = metadata.id
  val name: String = metadata.webTitle
  val isSeries: Boolean = properties.tagType == "series"
  val isBlog: Boolean = properties.tagType == "blog"
  val isSectionTag: Boolean = SectionTagLookUp.sectionId(metadata.id).contains(metadata.section)
  val showSeriesInMeta = metadata.id != "childrens-books-site/childrens-books-site"
  val isKeyword = properties.tagType == "keyword"
  val isFootballTeam = properties.references.exists(_.`type` == "pa-football-team")
  val isFootballCompetition = properties.references.exists(_.`type` == "pa-football-competition")
  val contributorImagePath = properties.bylineImageUrl.map(ImgSrc(_, Contributor))
}
