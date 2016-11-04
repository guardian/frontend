package dfp

import common.AkkaAgent
import common.dfp.GuCreativeTemplate

import scala.concurrent.Future

object CreativeTemplateAgent {

  private lazy val cache = AkkaAgent(Seq.empty[GuCreativeTemplate])

  def refresh(): Future[Seq[GuCreativeTemplate]] = {
    cache alterOff { oldData =>
      val freshData = DfpApi.readActiveCreativeTemplates()
      if (freshData.nonEmpty) freshData else oldData
    }
  }

  def get: Seq[GuCreativeTemplate] = cache.get()
}
