package mvt

import conf.switches._
import org.joda.time.LocalDate
import play.api.mvc.RequestHeader
import views.support.CamelCase
import conf.switches.Switches.ServerSideTests

// To add a test, do the following:
// 1. Create an object that extends TestDefinition
// 2. Add the object to ActiveTests.tests
//
// object ExampleTest extends TestDefinition(...)
//
// object ActiveTests extends Tests {
//    val tests = List(ExampleTest)
// }

object ABNewHeaderVariant extends TestDefinition(
  name = "ab-new-header-variant",
  description = "users in this test will see the new header",
  owners = Seq(Owner.withGithub("natalialkb")),
  sellByDate = new LocalDate(2016, 12, 8) // Thursday
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-header").contains("variant")
  }
}

object ABNewHeaderControl extends TestDefinition(
  name = "ab-new-header-control",
  description = "control for the new header test",
  owners = Seq(Owner.withGithub("natalialkb")),
  sellByDate = new LocalDate(2016, 12, 8) // Thursday
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-header").contains("control")
  }
}

object CommercialClientLoggingVariant extends TestDefinition(
  name = "commercial-client-logging",
  description = "A slice of the audience who will post their commercial js performance data",
  owners = Seq(Owner.withGithub("rich-nguyen")),
  sellByDate = new LocalDate(2016, 11, 1)
  ) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ccl").contains("ccl-A")
  }
}

object CommercialHeaderBiddingSonobiVariant extends TestDefinition(
  name = "commercial-hb-sonobi",
  description = "A test variant for the sonobi header-bidding integration",
  owners = Seq(Owner.withGithub("rich-nguyen"), Owner.withGithub("janua")),
  sellByDate = new LocalDate(2016, 11, 1)
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-comm-hb-test").contains("sonobi")
  }
}

object CommercialHeaderBiddingControl extends TestDefinition(
  name = "commercial-hb-control",
  description = "A control group for the header bidding test",
  owners = Seq(Owner.withGithub("rich-nguyen"), Owner.withGithub("janua")),
  sellByDate = new LocalDate(2016, 11, 1)
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-comm-hb-test").contains("control")
  }
}

trait ServerSideABTests {
  val tests: Seq[TestDefinition]

  def getJavascriptConfig(implicit request: RequestHeader): String = {
    tests
      .filter(_.isParticipating)
      .map { test => s""""${CamelCase.fromHyphenated(test.name)}" : ${test.switch.isSwitchedOn}""" }
      .mkString(",")
  }
}

object ActiveTests extends ServerSideABTests {
  val tests: Seq[TestDefinition] = List(
    ABNewHeaderVariant,
    ABNewHeaderControl,
    CommercialClientLoggingVariant,
    CommercialHeaderBiddingSonobiVariant,
    CommercialHeaderBiddingControl
  )
}

abstract case class TestDefinition (
  name: String,
  description: String,
  owners: Seq[Owner],
  sellByDate: LocalDate
) {
  val switch: Switch = Switch(
    SwitchGroup.ServerSideABTests,
    name,
    description,
    owners,
    conf.switches.Off,
    sellByDate,
    exposeClientSide = true
  )

  private def isSwitchedOn: Boolean = switch.isSwitchedOn && ServerSideTests.isSwitchedOn

  def canRun(implicit request: RequestHeader): Boolean
  def isParticipating(implicit request: RequestHeader): Boolean = isSwitchedOn && canRun(request)

}
