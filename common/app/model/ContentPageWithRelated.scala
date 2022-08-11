package model

trait ContentPageWithRelated extends ContentPage {
  def related: RelatedContent
}
