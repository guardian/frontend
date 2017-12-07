package model

import com.gu.contentapi.client.model.v1.{Podcast => ApiPodcast, Reference => ApiReference, Tag => ApiTag}
import common.commercial.CommercialProperties
import common.{Pagination, RelativePathEscaper}
import conf.Configuration
import contentapi.SectionTagLookUp
import play.api.libs.json._
import views.support.{Contributor, ImgSrc, Item140}

object Tag {

  def makeMetadata(tag: TagProperties, pagination: Option[Pagination]): MetaData = {

    val javascriptConfigOverrides: Map[String, JsValue] = Map(
      ("keywords", JsString(tag.webTitle)),
      ("keywordIds", JsString(tag.id)),
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
      section = Some(SectionId.fromId(tag.sectionId)),
      pillar = None,
      designType = None,
      adUnitSuffix = AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(tag.id, tag.sectionId),
      description = tag.description,
      pagination = pagination,
      contentType = Some(DotcomContentType.Tag),
      isFront = true,
      rssPath = Some(s"/${tag.id}/rss"),
      iosType = tag.sectionId match {
        case "crosswords" => None
        case _ => Some("list")
      },
      javascriptConfigOverrides = javascriptConfigOverrides,
      opengraphPropertiesOverrides = openGraphPropertiesOverrides,
      twitterPropertiesOverrides = Map("twitter:card" -> "summary"),
      commercial = tag.commercial
    )
  }

  def make(tag: ApiTag, pagination: Option[Pagination] = None): Tag = {

    val richLinkId = tag.references.find(_.`type` == "rich-link")
      .map(_.id.stripPrefix("rich-link/"))
      .filter(_.matches( """https?://www\.theguardian\.com/.*"""))

    Tag(
      properties = TagProperties.make(tag),
      pagination = pagination,
      richLinkId = richLinkId
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

  def split(s: String): (String, String) = {
    val parts = s.split("/")
    parts(0) -> parts.drop(1).mkString("/")
  }

  def toJavaScript(s: String): JsObject = {
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
      references = tag.references.map(Reference.make),
      paidContentType = tag.paidContentType,
      commercial = Some(CommercialProperties.fromTag(tag))
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
  references: Seq[Reference],
  paidContentType: Option[String],
  commercial: Option[CommercialProperties]
) {
 val footballBadgeUrl = references.find(_.`type` == "pa-football-team")
      .map(_.id.split("/").drop(1).mkString("/"))
      .map(teamId => s"${Configuration.staticSport.path}/football/crests/120/$teamId.png")
}

case class Tag (
  properties: TagProperties,
  pagination: Option[Pagination],
  richLinkId: Option[String]

) extends StandalonePage {

  override val metadata: MetaData = Tag.makeMetadata(properties, pagination)

  def isOfType(typeName: String): Boolean = properties.tagType == typeName || isOfPaidType(typeName)
  def isOfPaidType(typeName: String): Boolean = properties.paidContentType.contains(typeName)

  val isContributor: Boolean = metadata.id.startsWith("profile/")
  val id: String = metadata.id
  val name: String = metadata.webTitle
  val isSeries: Boolean = isOfType("Series")
  val isBlog: Boolean = isOfType("Blog")
  val isSectionTag: Boolean = SectionTagLookUp.sectionId(metadata.id).contains(metadata.sectionId)
  val showSeriesInMeta = metadata.id != "childrens-books-site/childrens-books-site"
  val isKeyword = isOfType("Keyword") || isOfPaidType("Topic")
  val isFootballTeam = properties.references.exists(_.`type` == "pa-football-team")
  val isFootballCompetition = properties.references.exists(_.`type` == "pa-football-competition")
  val contributorImagePath = properties.bylineImageUrl.map(ImgSrc(_, Contributor))
}
