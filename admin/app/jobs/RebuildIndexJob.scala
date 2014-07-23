package jobs

import common.{Logging, ExecutionContexts, StopWatch}
import indexes.{TagPage, AllTagsEnumerator}

import scala.util.{Success, Failure}

object RebuildIndexJob extends ExecutionContexts with Logging {
  def run() {
    val stopWatch = new StopWatch

    log.info("Rebuilding site map - loading all tags from Content API")

    val tagPagesFuture = TagPage.fromEnumerator(AllTagsEnumerator.allTags)

    tagPagesFuture onComplete {
      case Success(tagPages) =>
        log.info(s"Loaded tag pages from Content API in ${stopWatch.elapsed}ms")

        /** TODO upload to S3 */

      case Failure(error) =>
        log.error(s"Encountered error loading tag pages from Content API after ${stopWatch.elapsed}ms", error)
    }
  }
}
