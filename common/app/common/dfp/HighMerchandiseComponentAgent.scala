package common.dfp

import model.Tag

trait HighMerchandiseComponentAgent {

  protected def highMerchandisingTargetedTags: HighMerchandisingTargetedTagSet

  def hasHighMerchandiseTarget(tags: Seq[Tag]): Boolean = {
    tags exists highMerchandisingTargetedTags.hasTag
  }
}
