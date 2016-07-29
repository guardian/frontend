package test

import controllers.HealthCheck
import org.scalatest.{BeforeAndAfterAll, Suites}

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
  new RichLinkControllerTest
) with SingleServerSuite
  with BeforeAndAfterAll
  with WithTestWsClient {

  override lazy val port: Int = new HealthCheck(wsClient).testPort
}
