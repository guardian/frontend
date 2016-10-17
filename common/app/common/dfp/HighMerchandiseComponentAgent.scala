package common.dfp

import model.Tag
import conf.switches.Switches._
import common.Edition

trait HighMerchandiseComponentAgent {

  protected def targetedHighMerchandisingLineItems: Seq[HighMerchandisingLineItem]

  def isTargetedByHighMerch(adUnitSuffix:String, tags: Seq[Tag],edition:Edition, pagePath:String) = {
    targetedHighMerchandisingLineItems.exists(_.matchesPageTargeting(adUnitSuffix, tags, edition,pagePath))
  }
}
