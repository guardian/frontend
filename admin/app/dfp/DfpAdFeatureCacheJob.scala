package dfp

import common.{ExecutionContexts, Logging}
import org.joda.time.DateTime
import play.api.libs.json.Json.{toJson, _}
import tools.Store

import scala.concurrent.Future

object DfpAdFeatureCacheJob extends ExecutionContexts with Logging {

  def run(): Future[Unit] = Future {
    val adFeatureTags = PaidForTag.fromLineItems(DfpDataHydrator().loadAllAdFeatures())
    if (adFeatureTags.nonEmpty) {
      val now = printLondonTime(DateTime.now())
      Store.putDfpAdFeatureReport(stringify(toJson(PaidForTagsReport(now, adFeatureTags))))
    }
  }
}
