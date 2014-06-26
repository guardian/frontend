package model

import com.gu.openplatform.contentapi.model.{ Tag => ApiTag }
import common.Pagination
import common.Reference
import views.support.{Contributor, ImgSrc, Item140}

case class Tag(private val delegate: ApiTag, override val pagination: Option[Pagination] = None) extends MetaData with AdSuffixHandlingForFronts {
  lazy val name: String = webTitle
  lazy val tagType: String = delegate.`type`

  lazy val id: String = delegate.id

  // some tags e.g. tone do not have an explicit section
  lazy val section: String = delegate.sectionId.getOrElse("global")

  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle
  override lazy val description = Some(s"Latest news and comment on $name from the Guardian")

  override lazy val url: String = SupportedUrl(delegate)

  lazy val contributorImagePath: Option[String] = delegate.bylineImageUrl.map(ImgSrc(_, Contributor))

  lazy val contributorLargeImagePath: Option[String] = delegate.bylineLargeImageUrl.map(ImgSrc(_, Item140))
  lazy val hasLargeContributorImage: Boolean = contributorLargeImagePath.nonEmpty

  lazy val isContributor: Boolean = id.startsWith("profile/")
  lazy val bio: String = delegate.bio.getOrElse("")
  lazy val isSeries: Boolean = delegate.tagType == "series"
  lazy val isBlog: Boolean = delegate.tagType == "blog"

  override lazy val isFront = true

  lazy val isSectionTag: Boolean = {
    val idParts = id.split("/")
    // a section tag id looks like     science/science
    !idParts.exists(_ != section)
  }

  override lazy val tags = Seq(this)

  lazy val isFootballTeam = delegate.references.exists(_.`type` == "pa-football-team")

  lazy val isFootballCompetition = delegate.references.exists(_.`type` == "pa-football-competition")

  lazy val tagWithoutSection = id.split("/")(1) // used for football nav

  override lazy val analyticsName = s"GFE:$section:$name"
  
  override lazy val rssPath = Some(s"/$id/rss")

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> name,
    "keywordIds" -> id,
    "content-type" -> "Tag"
  ) ++ Map("references" -> delegate.references.map(r => Reference(r.id)))
}
