package jobs

import com.gu.contentapi.client.model.v1.Tag
import common.{GuLogging, StopWatch}
import contentapi.ContentApiClient
import indexes.{ContentApiTagsEnumerator, TagPages}
import model.{TagIndex, TagIndexListings}
import services.TagIndexesS3

import scala.concurrent.{ExecutionContext, Future, blocking}

class RebuildIndexJob(contentApiClient: ContentApiClient)(implicit executionContext: ExecutionContext)
    extends GuLogging {

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

    for {
      keywords <- contentApiTagsEnumerator.enumerateTagType("keyword")
      series <- contentApiTagsEnumerator.enumerateTagType("series")
    } yield {
      val tags = (keywords ++ series).toSet
      val tagsBySection: Map[String, Set[Tag]] = tags.filter(tagPages.invalidSectionsFilter).groupBy(_.sectionId.get)
      val tagsByWebTitle: Map[String, Set[Tag]] = tagPages.byWebTitle(tags)

      blocking {
        saveToS3("keywords", tagPages.toPages(tagsByWebTitle)(alphaTitle, tagPages.asciiLowerWebTitle))
        saveToS3(
          "keywords_by_section",
          tagPages.toPages(tagsBySection)(TagPages.validSections(_), tagPages.asciiLowerWebTitle),
        )
      }
    }
  }

  private def tagsByPublication(tags: Seq[Tag]) = {
    tags.toSet
      .filter(tagPages.publicationsFilter)
      .groupBy(tag => tagPages.tagHeadKey(tag.id).getOrElse("publication"))
  }

  def rebuildNewspaperBooks(): Future[Unit] = {
    for {
      newspaperBooks <- contentApiTagsEnumerator.enumerateTagType("newspaper-book")
    } yield {
      val booksByPublication: Map[String, Set[Tag]] = tagsByPublication(newspaperBooks)

      blocking {
        saveToS3("newspaper_books", tagPages.toPages(booksByPublication)(alphaTitle, tagPages.asciiLowerWebTitle))
      }
    }
  }

  def rebuildNewspaperBookSections(): Future[Unit] = {
    for {
      newspaperBookSections <- contentApiTagsEnumerator.enumerateTagType("newspaper-book-section")
    } yield {
      val bookSectionsByPublication: Map[String, Set[Tag]] = tagsByPublication(newspaperBookSections)
      blocking {
        saveToS3(
          "newspaper_book_sections",
          tagPages.toPages(bookSectionsByPublication)(alphaTitle, tagPages.asciiLowerWebTitle),
        )
      }
    }
  }

  def rebuildContributorIndex(): Future[Unit] = {
    for {
      contributors <- contentApiTagsEnumerator.enumerateTagType("contributor")
    } yield {
      val contributorsByNameOrder: Map[String, Set[Tag]] = contributors.toSet
        .groupBy(tag => tagPages.alphaIndexKey(tag.lastName orElse tag.firstName getOrElse tag.webTitle))

      blocking {
        saveToS3("contributors", tagPages.toPages(contributorsByNameOrder)(alphaTitle, tagPages.nameOrder))
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
