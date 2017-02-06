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


object ABNewNavVariantSeven extends TestDefinition(
  name = "ab-new-nav-variant-seven",
  description = "users in this test will see the new header seventh variant",
  owners = Seq(Owner.withGithub("natalialkb")),
  sellByDate = new LocalDate(2017, 2, 8)
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-header").contains("variantseven")
  }
}

object ABNewNavControl extends TestDefinition(
  name = "ab-new-nav-control",
  description = "control for the new header test",
  owners = Seq(Owner.withGithub("natalialkb")),
  sellByDate = new LocalDate(2017, 2, 8)
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-header").contains("control")
  }
}

object CommercialClientLoggingVariant extends TestDefinition(
  name = "commercial-client-logging",
  description = "A slice of the audience who will post their commercial js performance data",
  owners = Seq(Owner.withGithub("rich-nguyen")),
  sellByDate = new LocalDate(2018, 2, 1)
  ) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ccl").contains("ccl-A")
  }
}

object WebpackTest extends TestDefinition(
  name = "ab-webpack-bundle",
  description = "for users in this test, website will serve standard JavaScript that has been bundled by Webpack",
  owners = Seq(Owner.withGithub("siadcock")),
  sellByDate = new LocalDate(2017, 2, 13)
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-webpack-bundle").contains("webpack")
  }
}

object WebpackControl extends TestDefinition(
  name = "ab-webpack-bundle-control",
  description = "control for Webpack test",
  owners = Seq(Owner.withGithub("siadcock")),
  sellByDate = new LocalDate(2017, 2, 13)
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-webpack-bundle").contains("control")
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
    ABNewNavVariantSeven,
    ABNewNavControl,
    CommercialClientLoggingVariant,
    WebpackTest,
    WebpackControl
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
