package services
import com.gu.contentapi.client.model.v1.VariantId.B
import common.{Box, GuLogging}
import contentapi.ContentApiClient

import scala.concurrent.{ExecutionContext, Future}

case class ArticleAbTest(a: String, b: String)

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

  private def refresh()(implicit ec: ExecutionContext): Future[Unit] = {

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
          .flatMap(test => test.variantLinks.collectFirst { case link if link.variantId == B => link.linkedShortPath })
          .map(bPath => ArticleAbTest(c.id, bPath))
      }.toList
      setAll(newTests)
    }
   }
}


/*todo
*  make call to capi to request article A/B test data
*  update box with the fetched article A/B test data
*  Add lifecycle management for the ArticleAbTestAgent
* */
