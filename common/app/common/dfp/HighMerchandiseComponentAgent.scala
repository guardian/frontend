package common.dfp

import model.Tag
import common.Edition

trait HighMerchandiseComponentAgent {

  protected def targetedHighMerchandisingLineItems: Seq[HighMerchandisingLineItem]

  def isTargetedByHighMerch(adUnitSuffix: String, tags: Seq[Tag], edition: Edition, pagePath: String): Boolean = {
    targetedHighMerchandisingLineItems.exists(_.matchesPageTargeting(adUnitSuffix, tags, edition, pagePath))
  }
}
