package common.dfp

import model.Tag
import conf.switches.Switches._

trait HighMerchandiseComponentAgent {

  protected def highMerchandisingTargetedTags: HighMerchandisingTargetedTagSet

  def hasHighMerchandisingTarget(tags: Seq[Tag]): Boolean = {
    if (highMerchandisingComponentSwitch.isSwitchedOn){
      true
    } else
    tags exists highMerchandisingTargetedTags.hasTag
  }
}
