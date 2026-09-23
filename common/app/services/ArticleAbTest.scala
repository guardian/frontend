package services
import com.gu.contentapi.client.model.v1.VariantId.B
import common.{Box, GuLogging}
import contentapi.ContentApiClient

import scala.concurrent.{ExecutionContext, Future}

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

    val futureContentWithActiveAbTests = contentApiClient.getResponse(activeAbTestQuery)

    for {
      contentWithActiveAbTests <- futureContentWithActiveAbTests
    } yield {
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

/*todo
 *  Add lifecycle management for the ArticleAbTestAgent
 * */
