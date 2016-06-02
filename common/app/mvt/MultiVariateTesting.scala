package mvt

import conf.switches.{SwitchGroup, Switch}
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
  new LocalDate(2016, 6, 10)
  ) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-hlt").contains("hlt-V")
  }
}

object ABNewHeaderVariant extends TestDefinition(
  name = "ab-new-header-variant",
  description = "Feature switch (0% test) for the new header",
  sellByDate = new LocalDate(2016, 6, 14)
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-header").contains("variant")
  }
}

object ABHeadlinesTestControl extends TestDefinition(
  "headlines-ab-control",
  "To test how much of a difference changing a headline makes (control group)",
  new LocalDate(2016, 6, 10)
  ) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-hlt").contains("hlt-C")
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
    ABHeadlinesTestVariant
  )
}

abstract case class TestDefinition (
  name: String,
  description: String,
  sellByDate: LocalDate
) {
  val switch: Switch = Switch(
    SwitchGroup.ServerSideABTests,
    name,
    description,
    conf.switches.Off,
    sellByDate,
    exposeClientSide = true
  )

  private def isSwitchedOn: Boolean = switch.isSwitchedOn && ServerSideTests.isSwitchedOn

  def canRun(implicit request: RequestHeader): Boolean
  def isParticipating(implicit request: RequestHeader): Boolean = isSwitchedOn && canRun(request)

}
