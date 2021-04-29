package model

case class InteractivePage(interactive: Interactive, related: RelatedContent) extends ContentPage {
  override lazy val item = interactive
}
