package model

import com.gu.openplatform.contentapi.model.{ Tag => ApiTag }
import common.Reference
import views.support.{Contributor, ImgSrc}

case class Tag(private val delegate: ApiTag) extends MetaData {
  lazy val name: String = webTitle
  lazy val tagType: String = delegate.`type`

  lazy val id: String = delegate.id

  // some tags e.g. tone do not have an explicit section
  lazy val section: String = delegate.sectionId.getOrElse("global")

  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle

  override lazy val url: String = SupportedUrl(delegate)

  lazy val contributorImagePath: Option[String] = delegate.bylineImageUrl.map(ImgSrc(_, Contributor))

  lazy val isContributor: Boolean = id.startsWith("profile/")
  lazy val bio: String = delegate.bio.getOrElse("")

  lazy val isSectionTag: Boolean = {
    val idParts = id.split("/")
    // a section tag id looks like     science/science
    !idParts.exists(_ != section)
  }

  lazy val isFootballTeam = delegate.references.exists(_.`type` == "pa-football-team")

  lazy val isFootballCompetition = delegate.references.exists(_.`type` == "pa-football-competition")

  lazy val tagWithoutSection = id.split("/")(1) // used for football nav

  override lazy val analyticsName = s"GFE:$section:$name"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> name,
    "content-type" -> "Tag"
  ) ++ Map("references" -> delegate.references.map(r => Reference(r.id)))
}
