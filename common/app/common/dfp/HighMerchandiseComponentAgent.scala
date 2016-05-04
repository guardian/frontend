package common.dfp

import model.Tag

trait HighMerchandiseComponentAgent {

//  protected def highMerchandisingTargetedTags: HighMerchandisingTargetedTagSet

  def hasHighMerchandiseTarget(tags: Seq[Tag]): Boolean = {
//    tags exists inlineMerchandisingTargetedTags.hasTag
    println(tags(0).properties)
    false
  }
}
