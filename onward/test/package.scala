package test

import org.scalatest.Suites
import controllers.ReverseContentCardController

class OnwardTestSuite extends Suites (
  new controllers.ChangeEditionControllerTest,
  new model.TopStoriesFeatureTest,
  new services.OnwardHealthcheckTest,
  new ChangeViewControllerTest,
  new MostPopularControllerTest,
  new MostPopularFeatureTest,
  new MostViewedVideoTest,
  new RelatedControllerTest,
  new RelatedFeatureTest,
  new SeriesControllerTest,
  new TopStoriesControllerTest,
  new VideoInSectionTest,
  new ContentCardControllerTest ) with SingleServerSuite {

  override lazy val port: Int = conf.HealthCheck.testPort
}