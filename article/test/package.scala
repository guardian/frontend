package test

import model.structuredData.BlogPostingTest
import org.scalatest.{Suites, Tag}
import play.api.test.Helpers

object ArticleComponents extends Tag("article components")

class ArticleTestSuite extends Suites (
  new MainMediaWidthsTest,
  new AnalyticsFeatureTest,
  new ArticleControllerTest,
  new ArticleMetaDataTest,
  new ArticleFeatureTest,
  new ArticleAmpValidityTest,
  new CdnHealthCheckTest,
  new SectionsNavigationFeatureTest,
  new MembershipAccessTest,
  new PublicationControllerTest,
  new BlogPostingTest
) with SingleServerSuite {
  override lazy val port: Int = 19005
}
