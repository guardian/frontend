package dfp

import com.github.nscala_time.time.Imports.DateTime
import common.dfp.{GuCreative, GuCreativeWrapper}
import org.joda.time.DateTime.now
import play.api.libs.json.Json
import tools.Store

import scala.concurrent.{ExecutionContext, Future}

class DfpTemplateCreativeCacheJob(dfpApi: DfpApi) {

  def run()(implicit executionContext: ExecutionContext): Future[Unit] =
    Future {
      val cached = Store.getDfpTemplateCreatives
      val threshold = GuCreative.lastModified(cached) getOrElse now.minusMonths(1)
      val recentlyModified = dfpApi.readTemplateCreativesModifiedSince(threshold)
      val merged = GuCreative.merge(cached, recentlyModified)
      val wrapper = GuCreativeWrapper(
        updatedTimeStamp = DateTime.now().toString,
        creatives = merged,
      )
      Store.putDfpTemplateCreatives(Json.stringify(Json.toJson(wrapper)))
//      Store.putDfpTemplateCreatives(Json.stringify(Json.toJson(merged)))
    }
}
