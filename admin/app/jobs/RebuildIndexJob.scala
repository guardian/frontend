package jobs

import common.{Logging, ExecutionContexts, StopWatch}
import indexes.{TagPages, ContentApiTagsEnumerator}
import services.TagIndexesS3

import scala.util.{Success, Failure}

object RebuildIndexJob extends ExecutionContexts with Logging {
  private def rebuildIndex(tagType: String) = {
    val stopWatch = new StopWatch

    log.info(s"Rebuilding $tagType indexes - loading all $tagType tags from Content API")

    val tagPagesFuture = TagPages.fromEnumerator(ContentApiTagsEnumerator.enumerateTagTypeFiltered(tagType))

    tagPagesFuture onComplete {
      case Success(tagPages) =>
        log.info(s"Loaded all $tagType tag pages from Content API in ${stopWatch.elapsed}ms")

        val s3StopWatch = new StopWatch

        tagPages foreach { tagPage =>
          log.info(s"Uploading $tagType ${tagPage.indexCharacter} index to S3")
          TagIndexesS3.putIndex(tagType, tagPage)
        }

        log.info(s"Uploaded ${tagPages.length} $tagType index pages to S3 after ${s3StopWatch.elapsed}ms")
        log.info(s"Completed job to rebuild $tagType indexes after ${stopWatch.elapsed}ms")

      case Failure(error) =>
        log.error(s"Encountered error loading $tagType tag pages from Content API after ${stopWatch.elapsed}ms", error)
    }

    tagPagesFuture
  }

  def run() {
    rebuildIndex("keyword") andThen { case _ => rebuildIndex("contributor") }
  }
}
