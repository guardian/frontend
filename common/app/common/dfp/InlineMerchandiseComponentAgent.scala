package common.dfp

import model.Tag

trait InlineMerchandiseComponentAgent {

  protected def inlineMerchandisingTargetedTags: InlineMerchandisingTagSet

  def hasInlineMerchandise(tags: Seq[Tag]): Boolean = {
    tags exists inlineMerchandisingTargetedTags.hasTag
  }
}
