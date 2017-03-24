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

object YouTubePosterOverride extends TestDefinition(
  name = "youtube-poster-override",
  description = "Users in the test will always see the trail image on YouTube atom content cards instead of the poster image",
  owners = Seq(Owner.withGithub("gidsg")),
  sellByDate = new LocalDate(2017, 4, 3)
  ) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-youtube-poster-override").contains("true")
  }
}

object ABNewRecipeDesign extends TestDefinition(
  name = "ab-new-recipe-design",
  description = "Users in the test will see the new design on articles with structured recipes",
  owners = Seq(Owner.withGithub("tsop14")),
  sellByDate = new LocalDate(2017, 4, 3)
) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-recipe-design").contains("variant")
  }
}

object PolyfillIO extends TestDefinition(
  name = "polyfill-io",
  description = "Users in the test will use polyfill.io to polyfill their browser capabilities",
  owners = Seq(Owner.withGithub("gustavpursche"), Owner.withGithub("gtrufitt")),
  sellByDate = new LocalDate(2017, 3, 29)
  ) {
  def canRun(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-polyfill-io").contains("true")
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
    CommercialClientLoggingVariant,
    YouTubePosterOverride,
    ABNewRecipeDesign,
    PolyfillIO
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
