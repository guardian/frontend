package model

trait PageWithStoryPackage extends ContentPageWithRelated {
  def article: Article
  lazy val item = article
  val articleSchemas = ArticleSchemas
}
