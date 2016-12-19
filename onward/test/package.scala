package test

import model.ApplicationContext
import org.scalatest.Suites

class OnwardTestSuite (implicit context: ApplicationContext) extends Suites (
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
