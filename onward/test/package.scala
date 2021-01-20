package test

import controllers._
import org.scalatest.Suites
import services.breakingnews.{BreakingNewsApiTest, BreakingNewsUpdaterTest}

class OnwardTestSuite
    extends Suites(
      new controllers.ChangeEditionControllerTest,
      new model.TopStoriesFeatureTest,
      new MostPopularControllerTest,
      new MostPopularFeatureTest,
      new MostViewedVideoTest,
      new RelatedControllerTest,
      new RelatedFeatureTest,
      new SeriesControllerTest,
      new TopStoriesControllerTest,
      new VideoInSectionTest,
      new RichLinkControllerTest,
      new NavigationControllerTest,
      new BreakingNewsApiTest,
      new BreakingNewsUpdaterTest,
      new NewsAlertControllerTest,
    )
    with SingleServerSuite {
  override lazy val port: Int = 19011
}
