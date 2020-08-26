package test

import org.scalatest.{Suites, Tag}

object ArticleComponents extends Tag("article components")

class ArticleTestSuite
    extends Suites(
      new MainMediaWidthsTest,
      new AnalyticsFeatureTest,
      new ArticleControllerTest,
      new ArticleMetaDataTest,
      new ArticleFeatureTest,
      new CdnHealthCheckTest,
      new SectionsNavigationFeatureTest,
      new MembershipAccessTest,
      new PublicationControllerTest,
      new LiveBlogControllerTest,
    )
    with SingleServerSuite {
  override lazy val port: Int = 19005
}
