package model

trait PageWithStoryPackage extends ContentPage with HasBlocks {
  def article: Article
  def related: RelatedContent
  override lazy val item = article
  val articleSchemas = ArticleSchemas
}
