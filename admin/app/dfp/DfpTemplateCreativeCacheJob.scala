package dfp

import common.ExecutionContexts
import common.dfp.GuCreative
import conf.switches.Switches.DfpCachingSwitch
import org.joda.time.DateTime.now
import play.api.libs.json.Json
import tools.Store

import scala.concurrent.Future

object DfpTemplateCreativeCacheJob extends ExecutionContexts {

  def run(): Future[Unit] = Future {
    if (DfpCachingSwitch.isSwitchedOn) {
      val cached = Store.getDfpTemplateCreatives
      val threshold = GuCreative.lastModified(cached) getOrElse now.minusMonths(1)
      val recentlyModified = DfpApi.loadTemplateCreativesModifiedSince(threshold)
      val merged = GuCreative.merge(cached, recentlyModified)
      Store.putDfpTemplateCreatives(Json.stringify(Json.toJson(merged)))
    }
  }
}
