package dfp

import common.{ExecutionContexts, AkkaAgent}
import scala.concurrent.future

// Cache of current DFP data, used initially by articles only.
object DfpAgent extends ExecutionContexts {

  private lazy val keywordsAgent = AkkaAgent[Seq[String]](Nil)

  def currentTargetedKeywords: Seq[String] = keywordsAgent.get()

  def refresh() {
    future {
      //      val lineItems = DfpApi.fetchCurrentLineItems()
      //      val keywords = DfpApi.fetchKeywordTargetingValues(lineItems)
      //      lineItemsAgent.update(lineItems)
      //      keywordsAgent.update(keywords)
    }
  }

  def stop() {
    keywordsAgent.close()
  }
}
