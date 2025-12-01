package model

import com.gu.contentapi.client.model.v1.Blocks

case class InteractivePage(interactive: Interactive, related: RelatedContent, blocks: Blocks)
    extends ContentPage
    with HasBlocks {
  override lazy val item = interactive
}
