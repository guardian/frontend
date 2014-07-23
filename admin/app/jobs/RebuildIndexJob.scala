package jobs

import common.{Logging, ExecutionContexts, StopWatch}
import indexes.{TagPages, ContentApiTagsEnumerator}

import scala.util.{Success, Failure}

object RebuildIndexJob extends ExecutionContexts with Logging {
  def run() {
    val stopWatch = new StopWatch

    log.info("Rebuilding keyword indexes - loading all keyword tags from Content API")

    val tagPagesFuture = TagPages.fromEnumerator(ContentApiTagsEnumerator.keywords)

    tagPagesFuture onComplete {
      case Success(tagPages) =>
        log.info(s"Loaded tag pages from Content API in ${stopWatch.elapsed}ms")

        /** TODO upload to S3 */

      case Failure(error) =>
        log.error(s"Encountered error loading tag pages from Content API after ${stopWatch.elapsed}ms", error)
    }
    
    /** TODO rebuild contributors */

  }
}
