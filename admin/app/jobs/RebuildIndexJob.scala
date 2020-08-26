package jobs

import common.{Logging, StopWatch}
import contentapi.ContentApiClient
import indexes.{ContentApiTagsEnumerator, TagPages}
import model.{TagIndexListings, TagIndex}
import play.api.libs.iteratee.Enumeratee
import services.TagIndexesS3

import scala.concurrent.{ExecutionContext, Future, blocking}

class RebuildIndexJob(contentApiClient: ContentApiClient)(implicit executionContext: ExecutionContext) extends Logging {

  val contentApiTagsEnumerator = new ContentApiTagsEnumerator(contentApiClient)
  val tagPages = new TagPages

  def saveToS3(parentKey: String, tagPages: Seq[TagIndex]) {
    val s3StopWatch = new StopWatch

    tagPages foreach { tagPage =>
      log.info(s"Uploading $parentKey ${tagPage.title} index to S3")
      TagIndexesS3.putIndex(parentKey, tagPage)
    }

    log.info(s"Uploaded ${tagPages.length} $parentKey index pages to S3 after ${s3StopWatch.elapsed}ms")

    val listingStopWatch = new StopWatch

    TagIndexesS3.putListing(parentKey, TagIndexListings.fromTagIndexPages(tagPages))

    log.info(s"Uploaded $parentKey listing in ${listingStopWatch.elapsed}ms")
  }

  /** The title for the alpha keys (A, B, C ... )
    *
    * Replace the hyphen with an ndash here as it looks better in the HTML. (The key needs to be a hyphen though so it
    * works in a web uri.)
    */
  private def alphaTitle(key: String) = key.toUpperCase.replace("-", "–")

  def rebuildKeywordIndexes(): Future[Unit] = {
    val keywords = contentApiTagsEnumerator.enumerateTagTypeFiltered("keyword")
    val series = contentApiTagsEnumerator.enumerateTagTypeFiltered("series")

    /** Subjects are indexed both alphabetically and by their parent section */
    (keywords andThen series).run(Enumeratee.zip(tagPages.bySection, tagPages.byWebTitle)) map {
      case (sectionMap, alphaMap) =>
        blocking {
          saveToS3("keywords", tagPages.toPages(alphaMap)(alphaTitle, tagPages.asciiLowerWebTitle))
          saveToS3(
            "keywords_by_section",
            tagPages.toPages(sectionMap)(TagPages.validSections(_), tagPages.asciiLowerWebTitle),
          )
        }
    }
  }

  def rebuildNewspaperBooks(): Future[Unit] = {
    contentApiTagsEnumerator.enumerateTagTypeFiltered("newspaper-book").run(tagPages.byPublication) map { booksMap =>
      blocking {
        saveToS3("newspaper_books", tagPages.toPages(booksMap)(alphaTitle, tagPages.asciiLowerWebTitle))
      }
    }
  }

  def rebuildNewspaperBookSections(): Future[Unit] = {
    contentApiTagsEnumerator.enumerateTagTypeFiltered("newspaper-book-section").run(tagPages.byPublication) map {
      bookSectionMap =>
        blocking {
          saveToS3("newspaper_book_sections", tagPages.toPages(bookSectionMap)(alphaTitle, tagPages.asciiLowerWebTitle))
        }
    }
  }

  def rebuildContributorIndex(): Future[Unit] = {
    contentApiTagsEnumerator.enumerateTagTypeFiltered("contributor").run(tagPages.byContributorNameOrder) map {
      alphaMap =>
        blocking {
          saveToS3("contributors", tagPages.toPages(alphaMap)(alphaTitle, tagPages.nameOrder))
        }
    }
  }

  implicit class RichFuture[A](future: Future[A]) {
    def withErrorLogging: Future[A] = {
      future.failed.foreach { throwable: Throwable =>
        log.error("Error rebuilding index", throwable)
      }

      future
    }
  }

  def run() {
    rebuildKeywordIndexes().withErrorLogging andThen {
      case _ =>
        rebuildContributorIndex().withErrorLogging andThen {
          case _ =>
            rebuildNewspaperBooks().withErrorLogging andThen {
              case _ => rebuildNewspaperBookSections().withErrorLogging
            }
        }
    }
  }

}
