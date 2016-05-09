package common.dfp

import model.Tag
import conf.switches.Switches._

trait HighMerchandiseComponentAgent {

  protected def highMerchandisingTargetedTags: HighMerchandisingTargetedTagSet

  def hasHighMerchandiseTarget(tags: Seq[Tag]): Boolean = {
    if (highMerchandiseComponentSwitch.isSwitchedOn){
      true
    } else
    tags exists highMerchandisingTargetedTags.hasTag
  }
}
