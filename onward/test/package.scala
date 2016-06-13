package test

import controllers.HealthCheck
import org.scalatest.Suites

class OnwardTestSuite extends Suites (
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
  new RichLinkControllerTest ) with SingleServerSuite {

  override lazy val port: Int = HealthCheck.testPort
}
