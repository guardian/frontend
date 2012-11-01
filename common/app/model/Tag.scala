package model

import com.gu.openplatform.contentapi.model.{ Tag => ApiTag }
import common.Reference

case class Tag(private val delegate: ApiTag) extends MetaData {
  lazy val name: String = webTitle
  lazy val tagType: String = delegate.`type`

  lazy val id: String = delegate.id
  lazy val section: String = delegate.sectionId.getOrElse("")
  lazy val apiUrl: String = delegate.apiUrl
  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle

  lazy val canonicalUrl: String = webUrl

  lazy val url: String = SupportedUrl(delegate)
  lazy val linkText: String = webTitle
  lazy val pageId = delegate

  lazy val contributorImageUrl: Option[String] = delegate.bylineImageUrl

  lazy val isContributor: Boolean = id.startsWith("profile/")
  lazy val bio: String = delegate.bio.getOrElse("")

  lazy val isSectionTag: Boolean = {
    val idParts = id.split("/")
    // a section tag id looks like     science/science
    !idParts.exists(_ != section)
  }

  override lazy val analyticsName = "GFE:" + section + ":" + name

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> name,
    "content-type" -> "Tag"
  ) ++ delegate.references.map(r => Reference(r.id)).toMap
}
