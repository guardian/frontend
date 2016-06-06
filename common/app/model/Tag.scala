package model

import com.gu.contentapi.client.model.v1.{Podcast => ApiPodcast, Reference => ApiReference, Sponsorship => ApiSponsorship, SponsorshipTargeting => ApiSponsorshipTargeting, SponsorshipType => ApiSponsorshipType, Tag => ApiTag}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichCapiDateTime
import common.commercial.BrandHunter
import common.{Edition, Pagination, RelativePathEscaper}
import conf.Configuration
import contentapi.SectionTagLookUp
import org.joda.time.DateTime
import play.api.libs.functional.syntax._
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
      sectionSummary = Some(SectionSummary.fromId(tag.sectionId)),
      analyticsName = s"GFE:${tag.sectionId}:${tag.webTitle}",
      adUnitSuffix = AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(tag.id, tag.sectionId),
      description = tag.description,
      pagination = pagination,
      contentType = "Tag",
      isFront = true,
      rssPath = Some(s"/${tag.id}/rss"),
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

sealed trait SponsorshipType {
  def name: String
}

case object Sponsored extends SponsorshipType {
  override val name: String = "sponsored"
}

case object Foundation extends SponsorshipType {
  override val name: String = "foundation"
}

case object PaidContent extends SponsorshipType {
  override val name: String = "paid-content"
}

object SponsorshipType {

  implicit val sponsorshipTypeFormat: Format[SponsorshipType] =
    (__ \ "name").format[String].inmap(name => make(name), (sponsorshipType: SponsorshipType) => sponsorshipType.name)

  def make(name: String): SponsorshipType = name match {
    case PaidContent.name => PaidContent
    case Foundation.name => Foundation
    case _ => Sponsored
  }
}

case class SponsorshipTargeting(
                                 validEditions: Seq[Edition],
                                 publishedSince: Option[DateTime]
                               )

object SponsorshipTargeting {

  implicit val sponsorshipTargetingFormat = Json.format[SponsorshipTargeting]

  def make(targeting: ApiSponsorshipTargeting): SponsorshipTargeting = {
    SponsorshipTargeting(
      targeting.validEditions.map(_.flatMap(Edition.byId)).getOrElse(Nil),
      targeting.publishedSince.map(_.toJodaDateTime)
    )
  }
}

case class Branding(
                     sponsorshipType: SponsorshipType,
                     sponsorName: String,
                     sponsorLogo: String,
                     sponsorLink: String,
                     aboutThisLink: String,
                     targeting: Option[SponsorshipTargeting]
                   ) {

  val label = sponsorshipType match {
    case PaidContent => "Paid for by"
    case _ => "Supported by"
  }

  def isTargeting(optPublicationDate: Option[DateTime], edition: Edition): Boolean = {

    def isTargetingEdition(validEditions: Seq[Edition]): Boolean = {
      validEditions.isEmpty || validEditions.contains(edition)
    }

    def isPublishedSince(optThreshold: Option[DateTime]): Boolean = {
      val comparison = for {
        publicationDate <- optPublicationDate
        threshold <- optThreshold
      } yield {
        publicationDate isAfter threshold
      }
      comparison getOrElse true
    }

    targeting.isEmpty || targeting.exists { t =>
      isTargetingEdition(t.validEditions) && isPublishedSince(t.publishedSince)
    }
  }
}

object Branding {

  implicit val brandingFormat = Json.format[Branding]

  def make(sponsorship: ApiSponsorship): Branding = {
    Branding(
      sponsorship.sponsorshipType match {
        case ApiSponsorshipType.PaidContent => PaidContent
        case ApiSponsorshipType.Foundation => Foundation
        case _ => Sponsored
      },
      sponsorship.sponsorName,
      sponsorship.sponsorLogo,
      sponsorship.sponsorLink,
      aboutThisLink = "/sponsored-content",
      sponsorship.targeting map SponsorshipTargeting.make
    )
  }
}

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
      activeBrandings = tag.activeSponsorships.map(_.map(Branding.make))
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
                          activeBrandings: Option[Seq[Branding]]
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
  val isSeries: Boolean = properties.tagType == "Series"
  val isBlog: Boolean = properties.tagType == "Blog"
  val isSectionTag: Boolean = SectionTagLookUp.sectionId(metadata.id).contains(metadata.section)
  val showSeriesInMeta = metadata.id != "childrens-books-site/childrens-books-site"
  val isKeyword = properties.tagType == "Keyword"
  val isFootballTeam = properties.references.exists(_.`type` == "pa-football-team")
  val isFootballCompetition = properties.references.exists(_.`type` == "pa-football-competition")
  val contributorImagePath = properties.bylineImageUrl.map(ImgSrc(_, Contributor))

  override def branding(edition: Edition): Option[Branding] = {
    BrandHunter.findTagBranding(this, publicationDate = None, edition)
  }
}
