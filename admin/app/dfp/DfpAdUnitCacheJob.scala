package dfp

import common.{AkkaAsync, ExecutionContexts, Logging}
import conf.Configuration
import tools.Store

import scala.concurrent.Future

object DfpAdUnitCacheJob extends ExecutionContexts with Logging {

  def run(): Future[Unit] = Future {
    AkkaAsync {
      val adUnits = DfpApi.readActiveAdUnits(Configuration.commercial.dfpAdUnitRoot)
      if (adUnits.nonEmpty) {
        val rows = adUnits.map(adUnit => s"${adUnit.id},${adUnit.path.mkString(",")}")
        val list = rows.mkString("\n")
        Store.putDfpActiveAdUnitList(list)
      }
    }
  }
}
