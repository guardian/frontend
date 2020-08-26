package common

import contentapi.SectionsLookUp
import controllers.IndexController
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import test.{
  ConfiguredTestSuite,
  TestRequest,
  WithMaterializer,
  WithTestContentApiClient,
  WithTestApplicationContext,
  WithTestWsClient,
}

@DoNotDiscover class CombinerControllerTest
    extends FlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  lazy val sectionsLookUp = new SectionsLookUp(testContentApiClient)
  lazy val indexController =
    new IndexController(testContentApiClient, sectionsLookUp, play.api.test.Helpers.stubControllerComponents())

  "Combiner" should "404 when there is no content for 2 tags" in {
    val result = indexController.renderCombiner("profile/grant-klopper", "tone/reviews")(TestRequest())
    status(result) should be(404)
  }
  "Combiner" should "404 when one or both tags are missing" in {
    val result = indexController.renderCombiner("commentisfree/commentisfree", "world/australia")(TestRequest())
    status(result) should be(404)
  }
}
