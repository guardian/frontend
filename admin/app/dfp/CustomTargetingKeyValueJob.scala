package dfp

import play.api.libs.json._
import tools.Store

import scala.concurrent.{ExecutionContext, Future}

// This object is run by the commercial lifecycle and writes a json S3 file that stores
// key value mappings. In contrast, the CustomTargetingAgent is used to resolve key/value ids to string names.
object CustomTargetingKeyValueJob {

  def run()(implicit executionContext: ExecutionContext): Future[Unit] = Future {
    val customTargeting = CustomTargetingAgent.get.data.values

    if (customTargeting.nonEmpty) {
      Store.putDfpCustomTargetingKeyValues(Json.stringify(Json.toJson(customTargeting)))
    }
  }
}
