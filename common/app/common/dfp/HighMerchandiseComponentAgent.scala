package common.dfp

import model.Tag

trait HighMerchandiseComponentAgent {

  protected def highMerchandisingTargetedTags: HighMerchandisingTargetedTagSet

  def hasHighMerchandiseTarget(tags: Seq[Tag]): Boolean = {
//    val value = tags exists highMerchandisingTargetedTags.hasTag
    tags exists highMerchandisingTargetedTags.hasTag
  }
}
