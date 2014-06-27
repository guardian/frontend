package tools

import conf.Configuration.commercial.dfpAccountId

object DfpLink {

  def lineItem(lineItemId: Long) = {
    s"https://www.google.com/dfp/$dfpAccountId#delivery/LineItemDetail/lineItemId=$lineItemId"
  }
}
