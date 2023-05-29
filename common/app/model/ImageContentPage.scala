package model

case class ImageContentPage(image: ImageContent, related: RelatedContent) extends ContentPage {
  override lazy val item: ImageContent = image
}
