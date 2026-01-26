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

  def saveToS3(parentKey: String, tagPages: Seq[TagIndex]): Unit = {
    val s3StopWatch = new StopWatch

    tagPages foreach { tagPage =>
      log.debug(s"Uploading $parentKey ${tagPage.title} index to S3")
      TagIndexesS3.putIndex(parentKey, tagPage)
    }

    log.info(s"Uploaded ${tagPages.length} $parentKey index pages to S3 after ${s3StopWatch.elapsed}ms")

    val listingStopWatch = new StopWatch

    TagIndexesS3.putListing(parentKey, TagIndexListings.fromTagIndexPages(tagPages))

    log.debug(s"Uploaded $parentKey listing in ${listingStopWatch.elapsed}ms")
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
      val tagsBySection: Map[String, Set[Tag]] = tags.filter(TagPages.invalidSectionsFilter).groupBy(_.sectionId.get)
      val tagsByWebTitle: Map[String, Set[Tag]] = TagPages.byWebTitle(tags)

      blocking {
        saveToS3("keywords", TagPages.toPages(tagsByWebTitle)(alphaTitle, TagPages.asciiLowerWebTitle))
        saveToS3(
          "keywords_by_section",
          TagPages.toPages(tagsBySection)(TagPages.validSections(_), TagPages.asciiLowerWebTitle),
        )
      }
    }
  }

  private def tagsByPublication(tags: Seq[Tag]) = {
    tags.toSet
      .filter(TagPages.publicationsFilter)
      .groupBy(tag => TagPages.tagHeadKey(tag.id).getOrElse("publication"))
  }

  def rebuildNewspaperBooks(): Future[Unit] = {
    for {
      newspaperBooks <- contentApiTagsEnumerator.enumerateTagType("newspaper-book")
    } yield {
      val booksByPublication: Map[String, Set[Tag]] = tagsByPublication(newspaperBooks)

      blocking {
        saveToS3("newspaper_books", TagPages.toPages(booksByPublication)(alphaTitle, TagPages.asciiLowerWebTitle))
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
          TagPages.toPages(bookSectionsByPublication)(alphaTitle, TagPages.asciiLowerWebTitle),
        )
      }
    }
  }

  def rebuildContributorIndex(): Future[Unit] = {
    for {
      contributors <- contentApiTagsEnumerator.enumerateTagType("contributor")
    } yield {
      val contributorsByNameOrder: Map[String, Set[Tag]] = contributors.toSet
        .groupBy(tag => TagPages.alphaIndexKeyForContributor(tag))

      blocking {
        saveToS3("contributors", TagPages.toPages(contributorsByNameOrder)(alphaTitle, TagPages.nameOrder))
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

  def run(): Unit = {
    rebuildKeywordIndexes().withErrorLogging andThen { case _ =>
      rebuildContributorIndex().withErrorLogging andThen { case _ =>
        rebuildNewspaperBooks().withErrorLogging andThen { case _ =>
          rebuildNewspaperBookSections().withErrorLogging
        }
      }
    }
  }
}
