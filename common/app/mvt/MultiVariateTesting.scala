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

object ABNewHeaderDummyTestControl extends TestDefinition(
  name = "ab-new-header-dummy-test-control",
  description = "New header dummy test control",
  owners = Seq(Owner.withGithub("nataliaLKB")),
  sellByDate = new LocalDate(2016, 7, 26) // Tuesday
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-header-dummy").contains("new-header-control")
  }
}

object ABNewHeaderDummyTestVariant extends TestDefinition(
  name = "ab-new-header-dummy-test-variant",
  description = "New header dummy test variant",
  owners = Seq(Owner.withGithub("nataliaLKB")),
  sellByDate = new LocalDate(2016, 7, 26) // Tuesday
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-header-dummy").contains("new-header-variant")
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
    ABNewHeaderDummyTestControl,
    ABNewHeaderDummyTestVariant
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
