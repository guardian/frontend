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

object ABHeadlinesTestVariant extends TestDefinition(
  "headlines-ab-variant",
  "To test how much of a difference changing a headline makes (variant group)",
  owners = Seq(Owner.withGithub("dominickendrick")),
  new LocalDate(2016, 8, 10) // Wednesday
  ) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-hlt").contains("hlt-V")
  }
}

object ABHeadlinesTestControl extends TestDefinition(
  "headlines-ab-control",
  "To test how much of a difference changing a headline makes (control group)",
  owners = Seq(Owner.withGithub("dominickendrick")),
  new LocalDate(2016, 8, 10) // Wednesday
  ) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-hlt").contains("hlt-C")
  }
}

object ABNewHeaderVariant extends TestDefinition(
  name = "ab-new-header-variant",
  description = "Feature switch (0% test) for the new header",
  owners = Seq(Owner.withGithub("natalialkb")),
  sellByDate = new LocalDate(2016, 9, 8) // Thursday
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-header").contains("variant")
  }
}

object CommercialClientLoggingVariant extends TestDefinition(
  name = "commercial-client-logging",
  description = "A slice of the audience who will post their commercial js performance data",
  owners = Seq(Owner.withGithub("rich-nguyen")),
  sellByDate = new LocalDate(2016, 9, 1)
  ) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ccl").contains("ccl-A")
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
    ABHeadlinesTestControl,
    ABHeadlinesTestVariant,
    CommercialClientLoggingVariant
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
