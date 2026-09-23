package services
import com.gu.contentapi.client.model.v1.VariantId.B
import common.{Box, GuLogging}
import contentapi.ContentApiClient

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

/** A single running article A/B test, mapping article A to its variant, article B.
  *
  * @param a
  *   the CAPI ID of article A (eg "music/2026/sep/16/orville-peck-interview-new-album-mule")
  * @param b
  *   the short path of article B (eg "p/x5zkef")
  */
case class ArticleAbTest(a: String, b: String)

/** ArticleAbTestAgent is an in-memory cache of the currently active article A/B tests.
  *
  * The cache is populated by periodically polling CAPI for content with an active A/B test (see `refresh`).
  */
class ArticleAbTestAgent(contentApiClient: ContentApiClient) extends GuLogging {
  // The maximum page size CAPI allows. Set explicitly (rather than relying on CAPI's default page size of 10) so we
  // don't silently truncate results if the number of active tests grows.
  private val maxPageSize = 200

  private val testsBox = Box[List[ArticleAbTest]](Nil)

  def tests: List[ArticleAbTest] = testsBox.get()

  def variantFor(articleAPath: String): Option[String] =
    testsBox.get().find(_.a == articleAPath).map(_.b)

  def upsert(articleAPath: String, articleBPath: String): Unit =
    testsBox.alter { existing =>
      ArticleAbTest(articleAPath, articleBPath) :: existing.filterNot(_.a == articleAPath)
    }

  def setAll(newTests: List[ArticleAbTest]): Unit =
    testsBox.alter(newTests)

  def remove(articleAPath: String): Unit =
    testsBox.alter(_.filterNot(_.a == articleAPath))

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    log.debug("Refreshing article ab test cache...")

    val activeAbTestQuery = contentApiClient
      .search()
      .containsActiveAbTest()
      .pageSize(maxPageSize)

    val futureContentWithActiveAbTests = contentApiClient.getResponse(activeAbTestQuery)

    futureContentWithActiveAbTests.onComplete {
      case Success(_) => log.debug("Successfully got content with active ab tests")
      case Failure(t) => log.error(s"Getting content with active ab tests failed with $t", t)
    }

    for {
      contentWithActiveAbTests <- futureContentWithActiveAbTests
    } yield {
      if (contentWithActiveAbTests.total > maxPageSize) {
        log.warn(
          s"Found ${contentWithActiveAbTests.total} pieces of content with active ab tests, " +
            s"but only requested $maxPageSize - some active tests will be missing from the cache.",
        )
      }

      val content = contentWithActiveAbTests.results

      val newTests = content.flatMap { c =>
        val maybeActiveTest = c.abTests.getOrElse(Seq.empty).find(_.ended.isEmpty)
        maybeActiveTest
          .flatMap(test =>
            test.variantLinks.collectFirst { case link if link.variantId == B => link.linkedShortPath.stripPrefix("/") },
          )
          .map(bPath => ArticleAbTest(c.id, bPath))
      }.toList
      setAll(newTests)
      log.debug("Successfully refreshed article ab test cache.")
    }
  }
}
