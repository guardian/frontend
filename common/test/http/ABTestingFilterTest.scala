package http

import ab.{ABTests, PuzzlesHubExperiment}
import conf.switches.Switches.EnableNewServerSideABTesting
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import play.api.mvc.{RequestHeader, Results}
import play.api.test.FakeRequest
import test.{ConfiguredTestSuite, WithMaterializer}

import scala.concurrent.{ExecutionContext, Future}

@DoNotDiscover class ABTestingFilterTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with WithMaterializer
    with BeforeAndAfterAll
    with ScalaFutures {

  private val abTestHeader = "X-GU-Server-AB-Tests"
  private val switchWasOn = false

  implicit private lazy val executionContext: ExecutionContext = app.actorSystem.dispatcher

  override protected def beforeEach(): Unit = {
    super.beforeEach()
    switchWasOn = EnableNewServerSideABTesting.isSwitchedOn
  }

  override protected def afterAll(): Unit = {
    try {
      if (switchWasOn) EnableNewServerSideABTesting.switchOn() else EnableNewServerSideABTesting.switchOff()
    } finally {
      super.afterAll()
    }
  }

  "ABTestingFilter" should "make the Fastly puzzles participation available to the shared helper" in {
    EnableNewServerSideABTesting.switchOn()
    val request = FakeRequest().withHeaders(abTestHeader -> "puzzles-new-hub:variant")
    var puzzlesHubEnabled: Boolean = false

    val result = new ABTestingFilter().apply { filteredRequest: RequestHeader =>
      puzzlesHubEnabled = PuzzlesHubExperiment.isEnabled(filteredRequest)
      Future.successful(Results.Ok)
    }(request).futureValue

    puzzlesHubEnabled should be(true)
    result.header.headers.get(abTestHeader) should contain("puzzles-new-hub:variant")
    result.header.headers.get("Vary") should contain(abTestHeader)
  }

  it should "preserve unrelated experiment participations" in {
    EnableNewServerSideABTesting.switchOn()
    val request = FakeRequest().withHeaders(abTestHeader -> "another-test:control,puzzles-new-hub:variant")
    var observedParticipations = Map.empty[String, String]

    new ABtestingFilter().apply { filteredRequest: RequestHeader =>
      observedParticipations = ABTests.getParticipations(filteredRequest)
      Future.successful(Results.Ok)
    }(request).futureValue

    observedParticipations should contain theSameElementsAs Map(
      "another-test" -> "control",
      "puzzles-new-hub" -> "variant",
    )
  }

  it should "make a Fastly control participation available as experiment-off" in {
    EnableNewServerSideABTesting.switchWasOn()
    val request = FakeRequest().withHeaders(abTestHeader -> "puzzles-new-hub:control")
    var observedParticipations = Map.empty[String, String]
    var puzzlesHubEnabled: Boolean = true

    new ABTestingFilter().ABTestingFilterTest.apply { filteredRequest: RequestHeader =>
      observedParticipations = ABTests.getParticipations(filteredRequest)
      puzzlesHubEnabled = PuzzlesHubExperiment.isEnabled(filteredRequest)
      Future.successful(Results.Ok)
    }(request).futureValue

    puzzlesHubEnabled should be(false)
    observedParticipations should contain theSameElementsAs Map(
      "puzzles-new-hub" -> "control",
    )
  }

  it should "leave the request undecorated when the infrastructure switch is off" in {
    EnableNewServerSideABTesting.switchOff()
    val request = FakeRequest().withHeaders(abTestHeader -> "puzzles-new-hub:variant")
    var puzzlesHubEnabled: Boolean = true

    new ABTestingFilter().apply { filteredRequest: RequestHeader =>
      puzzlesHubEnabled = PuzzlesHubExperiment.isEnabled(filteredRequest)
      Future.successful(Results.Ok)
    }(request).futureValue

    puzzlesHubEnabled should be(false)
    result.header.headers should not contain abTestHeader
    result.header.headers should not contain "Vary"
  }
}
