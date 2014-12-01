package model

import com.gu.contentapi.client.model.{Tag => ApiTag, Podcast}
import common.{Pagination, Reference}
import conf.Configuration
import play.api.libs.json.{JsArray, JsString, JsValue}
import views.support.{Contributor, ImgSrc, Item140, Item360}

case class Tag(private val delegate: ApiTag, override val pagination: Option[Pagination] = None) extends MetaData with AdSuffixHandlingForFronts {
  lazy val name: String = webTitle
  lazy val tagType: String = delegate.`type`

  lazy val id: String = delegate.id

  // some tags e.g. tone do not have an explicit section
  lazy val section: String = delegate.sectionId.getOrElse("global")

  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle
  lazy val sectionName: String = delegate.sectionName.getOrElse("global")
  override lazy val description = delegate.description

  override lazy val url: String = SupportedUrl(delegate)

  lazy val contributorImagePath: Option[String] = delegate.bylineImageUrl.map(ImgSrc(_, Contributor))

  lazy val openGraphImage: Option[String] =
    delegate.bylineImageUrl.map(ImgSrc(_, Item140)).map { s: String => if (s.startsWith("//")) s"http:$s" else s}
      .orElse(getFootballBadgeUrl)

  lazy val openGraphDescription: Option[String] = if (bio.nonEmpty) Some(bio) else description

  lazy val contributorLargeImagePath: Option[String] = delegate.bylineLargeImageUrl

  lazy val isContributor: Boolean = id.startsWith("profile/")
  lazy val bio: String = delegate.bio.getOrElse("")
  lazy val isSeries: Boolean = tagType == "series"
  lazy val isBlog: Boolean = tagType == "blog"

  override lazy val isFront = true

  lazy val isSectionTag: Boolean = {
    val idParts = id.split("/")
    // a section tag id looks like     science/science
    !idParts.exists(_ != section)
  }

  lazy val showSeriesInMeta = id != "commentisfree/commentisfree"  &&  id != "childrens-books-site/childrens-books-site"

  lazy val isKeyword = tagType == "keyword"

  override lazy val tags = Seq(this)

  lazy val isFootballTeam = delegate.references.exists(_.`type` == "pa-football-team")

  lazy val isFootballCompetition = delegate.references.exists(_.`type` == "pa-football-competition")

  lazy val getFootballBadgeUrl: Option[String] = delegate.references.find(_.`type` == "pa-football-team")
    .map(_.id.split("/").drop(1).mkString("/"))
    .map(teamId => s"${Configuration.staticSport.path}/football/crests/120/$teamId.png")

  lazy val tagWithoutSection = id.split("/")(1) // used for football nav

  override lazy val analyticsName = s"GFE:$section:$name"

  override lazy val rssPath = Some(s"/$id/rss")

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ Map(
    ("keywords", JsString(name)),
    ("keywordIds", JsString(id)),
    ("contentType", JsString("Tag")),
    ("references", JsArray(delegate.references.toSeq.map(ref => Reference.toJavaScript(ref.id))))
  )

  override def openGraph: Map[String, String] = super.openGraph ++
    optionalMapEntry("og:description", openGraphDescription) ++
    optionalMapEntry("og:image", openGraphImage)

  override def cards: List[(String, String)] = super.cards ++
    List("twitter:card" -> "summary")

  lazy val podcast: Option[Podcast] = delegate.podcast

  private def optionalMapEntry(key:String, o: Option[String]): Map[String, String] =
    o.map(value => Map(key -> value)).getOrElse(Map())
}
