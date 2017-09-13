package dfp

import common.{AkkaAsync, Logging}
import conf.Configuration
import tools.Store

import scala.concurrent.{ExecutionContext, Future}


class DfpAdUnitCacher(val rootAdUnit: Any, val filename: String) extends Logging {

  def run(akkaAsync: AkkaAsync)(implicit executionContext: ExecutionContext): Future[Unit] = Future {
    akkaAsync {
      val adUnits = DfpApi.readActiveAdUnits(rootAdUnit.toString)
      if (adUnits.nonEmpty) {
        val rows = adUnits.map(adUnit => s"${adUnit.id},${adUnit.path.mkString(",")}")
        val list = rows.mkString("\n")
        Store.putDfpAdUnitList(filename, list)
      }
    }
  }
}

object DfpAdUnitCacheJob extends DfpAdUnitCacher(Configuration.commercial.dfpAdUnitGuRoot, Configuration.commercial.dfpActiveAdUnitListKey)

object DfpFacebookIaAdUnitCacheJob extends DfpAdUnitCacher(Configuration.commercial.dfpFacebookIaAdUnitRoot, Configuration.commercial.dfpFacebookIaAdUnitListKey)

object DfpMobileAppAdUnitCacheJob extends DfpAdUnitCacher(Configuration.commercial.dfpMobileAppsAdUnitRoot, Configuration.commercial.dfpMobileAppsAdUnitListKey)

