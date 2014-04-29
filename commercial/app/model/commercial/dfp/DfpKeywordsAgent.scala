package model.commercial.dfp

import common.AkkaAgent
import services.DfpApi

object DfpKeywordsAgent {

  lazy val agent = AkkaAgent[Seq[String]](Nil)

  def refresh() {
    agent.update(DfpApi.fetchCurrentKeywordTargetingValues())
  }

  def stop() {
    agent.close()
  }
}
