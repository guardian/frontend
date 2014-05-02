package dfp

import common.{ExecutionContexts, AkkaAgent}
import conf.Configuration.commercial.dfpDataKey
import scala.concurrent.future
import services.S3

object DfpAgent extends ExecutionContexts {

  private lazy val targetedKeywordsAgent = AkkaAgent[Seq[String]](Nil)

  def targetedKeywords: Seq[String] = targetedKeywordsAgent.get()

  def refresh() {
    future {
      val json = S3.get(dfpDataKey)
      println(json)
    }

  }

  def stop() {
    targetedKeywordsAgent.close()
  }
}
