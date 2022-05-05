package football.containers

import org.scalatest._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import test._

@DoNotDiscover class FixturesAndResultsTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with WithTestApplicationContext
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with FootballTestData
    with WithTestExecutionContext
    with WithTestFootballClient {

  lazy val fixturesAndResults = new FixturesAndResults(
    testCompetitionsService.competitionsWithTodaysMatchesAndFutureFixtures,
  )
  implicit val fakeRequest = TestRequest()

  "Creating container for a given team" should "be successful" in {

    fixturesAndResults.makeContainer("liverpool") match {
      case Some(container) =>
        container.displayName.get should be("Fixtures and results")
        container.dataId should be("fixtures-and-results")
        container.index should be(1)
        container.containerLayout.get.slices.length should be(1)
        container.containerLayout.get.remainingCards.length should be(0)
      case None =>
        fail("Expected: Some(container). Got: None")
    }
  }

}
