package common.dfp

import model.Tag
import conf.switches.Switches._

trait HighMerchandiseComponentAgent {

  protected def highMerchandisingTargetedTags: HighMerchandisingLineItemTargetsSeq

  def hasHighMerchandisingTarget(tags: Seq[Tag]): Boolean = {
    highMerchandisingComponentSwitch.isSwitchedOff ||
      (tags exists highMerchandisingTargetedTags.hasTag)
  }

  def hasHighMerchandisingAdUnit(adUnitSuffix: String) = {
    println("in highmerchcomponent agent method")
    highMerchandisingTargetedTags.hasAdUnit(adUnitSuffix)
  }
}
