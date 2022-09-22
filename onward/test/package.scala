package test

import org.scalatest.Suites
import services.RelatedContentServiceTest

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
      new RelatedContentServiceTest,
    )
    with SingleServerSuite {}
