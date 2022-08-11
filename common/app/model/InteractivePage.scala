package model

case class InteractivePage(interactive: Interactive, related: RelatedContent) extends ContentPageWithRelated {
  override lazy val item = interactive
}
