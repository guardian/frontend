package test

import org.scalatest.Suites
import play.api.Environment

class OnwardTestSuite (implicit env: Environment) extends Suites (
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
  new RichLinkControllerTest
) with SingleServerSuite {
  override lazy val port: Int = 19011
}
