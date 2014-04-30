package dfp

import com.google.api.ads.dfp.axis.v201403.LineItem
import common.{ExecutionContexts, AkkaAgent}
import scala.concurrent.future
import services.DfpApi

// Cache of current DFP data, used initially by articles only.
object DfpAgent extends ExecutionContexts {

  private lazy val lineItemsAgent = AkkaAgent[Seq[LineItem]](Nil)
  private lazy val keywordsAgent = AkkaAgent[Seq[String]](Nil)

  def currentLineItems: Seq[LineItem] = lineItemsAgent.get()

  def currentTargetedKeywords: Seq[String] = keywordsAgent.get()

  def refresh() {
    future {
      val lineItems = DfpApi.fetchCurrentLineItems()
      val keywords = DfpApi.fetchKeywordTargetingValues(lineItems)
      lineItemsAgent.update(lineItems)
      keywordsAgent.update(keywords)
    }
  }

  def stop() {
    lineItemsAgent.close()
    keywordsAgent.close()
  }
}
