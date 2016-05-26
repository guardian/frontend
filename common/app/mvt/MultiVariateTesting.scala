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

object ABOpenGraphOverlay extends TestDefinition(
  name = "ab-open-graph-overlay",
  description = "Add a branded overlay to images cached by the Facebook crawler",
  sellByDate = new LocalDate(2016, 6, 29)
) {
  override def isParticipating(implicit request: RequestHeader): Boolean = {
    request.queryString.get("page").exists(_.contains("facebookOverlayVariant")) && super.isParticipating(request)
  }
}


object ABHeadlinesTestVariant extends TestDefinition(
  "headlines-ab-variant",
  "To test how much of a difference changing a headline makes (variant group)",
  new LocalDate(2016, 6, 10)
  ) {
  override def isParticipating(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-hlt").contains("hlt-V") && super.isParticipating(request)
  }
}

object ABNewHeaderVariant extends TestDefinition(
  name = "ab-new-header-variant",
  description = "Feature switch (0% test) for the new header",
  sellByDate = new LocalDate(2016, 6, 14)
) {
  override def isParticipating(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-header").contains("variant") && super.isParticipating(request)
  }
}

object ABHeadlinesTestControl extends TestDefinition(
  "headlines-ab-control",
  "To test how much of a difference changing a headline makes (control group)",
  new LocalDate(2016, 6, 10)
  ) {
  override def isParticipating(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-hlt").contains("hlt-C") && super.isParticipating(request)
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
    ABOpenGraphOverlay,
    ABNewHeaderVariant,
    ABHeadlinesTestControl,
    ABHeadlinesTestVariant
  )
}

case class TestDefinition (
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
  def isParticipating(implicit request: RequestHeader): Boolean = switch.isSwitchedOn && ServerSideTests.isSwitchedOn
}
