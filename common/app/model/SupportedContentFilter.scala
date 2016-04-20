package model

object SupportedContentFilter {
  def apply(content: Seq[Content]) = content.filter { c =>
      c.tags.isArticle || c.tags.isLiveBlog || c.tags.isGallery || c.tags.isVideo || c.tags.isSudoku
  }.filterNot { c => c.tags.isPoll }
}
