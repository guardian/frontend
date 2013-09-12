package model

object SupportedContentFilter {
  def apply(content: Seq[Content]) = content.filter { c =>
      c.isArticle || c.isLiveBlog || c.isGallery || c.isVideo || c.isSudoku
  }.filterNot { c => c.isPoll }
}
