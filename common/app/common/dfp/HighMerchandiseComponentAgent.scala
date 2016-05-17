package common.dfp

import model.Tag
import conf.switches.Switches._

trait HighMerchandiseComponentAgent {

  protected def highMerchandisingTargetedTags: TargetedHighMerchandisingLineItems

  def hasHighMerchAdAndTag(adUnitSuffix:String, tags: Seq[Tag]) = {
    highMerchandisingComponentSwitch.isSwitchedOff ||
    highMerchandisingTargetedTags.hasAdUnitAndTag(adUnitSuffix, tags)
  }
}
