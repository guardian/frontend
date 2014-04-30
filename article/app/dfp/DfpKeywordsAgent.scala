package dfp

import common.AkkaAgent
import services.DfpApi

// Cache of current keywords targeted by DFP.
object DfpKeywordsAgent {

  private lazy val agent = AkkaAgent[Seq[String]](Nil)

  def currentTargetedKeywords: Seq[String] = agent.get()

  def refresh() {
    agent.update(DfpApi.fetchCurrentKeywordTargetingValues())
  }

  def stop() {
    agent.close()
  }
}
