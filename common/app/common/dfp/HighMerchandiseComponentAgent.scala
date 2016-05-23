package common.dfp

import model.Tag
import conf.switches.Switches._

trait HighMerchandiseComponentAgent {

  protected def targetedHighMerchandisingLineItems: Seq[HighMerchandisingLineItem]

  def hasHighMerchAdAndTag(adUnitSuffix:String, tags: Seq[Tag]) = {
    highMerchandisingComponentSwitch.isSwitchedOff ||
    targetedHighMerchandisingLineItems.exists(_.matchesAdUnitAndTag(adUnitSuffix, tags))
  }
}
