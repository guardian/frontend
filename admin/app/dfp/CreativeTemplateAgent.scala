package dfp

import common.AkkaAgent
import common.dfp.GuCreativeTemplate
import conf.switches.Switches.DfpCachingSwitch

import scala.concurrent.Future

object CreativeTemplateAgent {

  private lazy val cache = AkkaAgent(Seq.empty[GuCreativeTemplate])

  def refresh(): Future[Seq[GuCreativeTemplate]] = {
    cache alterOff { oldData =>
      if (DfpCachingSwitch.isSwitchedOn) {
        val freshData = DfpApi.loadActiveCreativeTemplates()
        if (freshData.nonEmpty) freshData else oldData
      } else oldData
    }
  }

  def get: Seq[GuCreativeTemplate] = cache.get()
}
