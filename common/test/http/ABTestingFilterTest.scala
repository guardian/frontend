package http

import ab.{ABTests, PuzzlesHubExperiment}
import conf.switches.Switches.EnableNewServerSideABTestsHeader
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterEach, DoNotDiscover}
import play.api.mvc.{RequestHeader, Results}
import play.api.test.FakeRequest
import test.{ConfiguredTestSuite, WithMaterializer}

import scala.concurrent.{ExecutionContext, Future}

@DoNotDiscover class ABTestingFilterTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with WithMaterializer
    with ScalaFutures
    with BeforeAndAfterEach {

  private val abTestHeader = "X-GU-Server-AB-Tests"
  private var switchWasOn = false

  implicit private lazy val executionContext: ExecutionContext = app.actorSystem.dispatcher

  override protected def beforeEach(): Unit = {
    super.beforeEach()
    switchWasOn = EnableNewServerSideABTestsHeader.isSwitchedOn
  }

  override protected def afterEach(): Unit = {
    try {
      if (switchWasOn) EnableNewServerSideABTestsHeader.switchOn() else EnableNewServerSideABTestsHeader.switchOff()
    } finally {
      super.afterEach()
    }
  }

  "ABTestingFilter" should "make the Fastly puzzles participation available to the shared helper" in {
    EnableNewServerSideABTestsHeader.switchOn()
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
    EnableNewServerSideABTestsHeader.switchOn()
    val request = FakeRequest().withHeaders(abTestHeader -> "another-test:control,puzzles-new-hub:variant")
    var observedParticipations = Map.empty[String, String]

    new ABTestingFilter().apply { filteredRequest: RequestHeader =>
      observedParticipations = ABTests.getParticipations(filteredRequest)
      Future.successful(Results.Ok)
    }(request).futureValue

    observedParticipations should contain theSameElementsAs Map(
      "another-test" -> "control",
      "puzzles-new-hub" -> "variant",
    )
  }

  it should "make a Fastly control participation available as experiment-off" in {
    EnableNewServerSideABTestsHeader.switchOn()
    val request = FakeRequest().withHeaders(abTestHeader -> "puzzles-new-hub:control")
    var observedParticipations = Map.empty[String, String]
    var puzzlesHubEnabled: Boolean = true

    new ABTestingFilter().apply { filteredRequest: RequestHeader =>
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
    EnableNewServerSideABTestsHeader.switchOff()
    val request = FakeRequest().withHeaders(abTestHeader -> "puzzles-new-hub:variant")
    var puzzlesHubEnabled: Boolean = true

    val result = new ABTestingFilter().apply { filteredRequest: RequestHeader =>
      puzzlesHubEnabled = PuzzlesHubExperiment.isEnabled(filteredRequest)
      Future.successful(Results.Ok)
    }(request).futureValue

    puzzlesHubEnabled should be(false)
    result.header.headers should not contain abTestHeader
    result.header.headers should not contain "Vary"
  }
}
