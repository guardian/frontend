package model

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.Edition

import scala.math.abs

object `package` {
  implicit class ApiContent2Is(content: ApiContent) {
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
    lazy val isSudoku: Boolean = content.tags exists { _.id == "type/sudoku" }
    lazy val isGallery: Boolean = content.tags exists { _.id == "type/gallery" }
    lazy val isVideo: Boolean = content.tags exists { _.id == "type/video" }
    lazy val isAudio: Boolean = content.tags exists { _.id == "type/audio" }
    lazy val isMedia: Boolean = isGallery || isVideo || isAudio
    lazy val isPoll: Boolean = content.tags exists { _.id == "type/poll" }
    lazy val isImageContent: Boolean = content.tags exists { tag => List("type/cartoon", "type/picture", "type/graphic").contains(tag.id) }
    lazy val isInteractive: Boolean = content.tags exists { _.id == "type/interactive" }
    lazy val isLiveBlog: Boolean = content.tags.exists(t => Tags.liveMappings.contains(t.id))
    lazy val isComment = content.tags.exists(t => Tags.commentMappings.contains(t.id))
    lazy val isFeature = content.tags.exists(t => Tags.featureMappings.contains(t.id))
    lazy val isReview = content.tags.exists(t => Tags.reviewMappings.contains(t.id))
  }

  implicit class Any2In[A](a: A) {
    def in(as: Set[A]): Boolean = as contains a
  }

  implicit class Int2RichInt(i: Int) {
    def distanceFrom(j: Int) = abs(j - i)
    def in(range: Range): Boolean = range contains i
  }

  def frontKeywordIds(pageId: String): Seq[String] = {
    val editions = Edition.all.map(_.id.toLowerCase).toSet

    val parts = pageId.split("/").toList match {
      case edition :: rest if editions.contains(edition) => rest
      case uneditionalised => uneditionalised
    }

    val path = parts.mkString("/")

    if (parts.isEmpty) {
      Nil
    } else if (parts.size == 1) {
      Seq(s"$path/$path")
    } else {
      val normalizedPath = parts.mkString("-")
      Seq(path, s"$normalizedPath/$normalizedPath")
    }
  }

  def stripHtml(text: String) = {
    text.replaceAll("""(<a[^>]*>)|(</a>)""", "")
  }

}
