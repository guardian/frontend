package model.liveblog

import model.{Article, ArticleSchemas, ContentPage, RelatedContent}

trait PageWithStoryPackage extends ContentPage {
  def article: Article
  def related: RelatedContent
  override lazy val item = article
  val articleSchemas = ArticleSchemas
}
