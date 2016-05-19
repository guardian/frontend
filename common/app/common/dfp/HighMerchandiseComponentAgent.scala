package common.dfp

import model.Tag
import conf.switches.Switches._

trait HighMerchandiseComponentAgent {

  protected def targetedHighMerchandisingLineItems: Seq[HighMerchandisingLineItem]

  def hasHighMerchAdAndTagandEdition(adUnitSuffix:String, tags: Seq[Tag],edition:String) = {
    highMerchandisingComponentSwitch.isSwitchedOff ||
    targetedHighMerchandisingLineItems.exists(_.matchesAdUnitAndTagandEdition(adUnitSuffix, tags,edition))
  }
}
