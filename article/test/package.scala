package test

import org.scalatest.{Suites, Tag}
import org.scalatestplus.play.PortNumber
import services.dotcomponents.ArticlePickerTest
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
    with SingleServerSuite {}
