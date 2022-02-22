package test

import org.scalatest.{Suites, Tag}
import services.dotcomponents.{ArticlePickerTest}
object ArticleComponents extends Tag("article components")

class ArticleTestSuite
    extends Suites(
      new MainMediaWidthsTest,
      new AnalyticsFeatureTest,
      new ArticleControllerTest,
      new CdnHealthCheckTest,
      new PublicationControllerTest,
      new LiveBlogControllerTest,
      new ArticlePickerTest,
    )
    with SingleServerSuite {
  override lazy val port: Int = 19005
}
