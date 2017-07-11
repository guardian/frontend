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

object CommercialGalleryBannerAdsVariant extends TestDefinition(
  name = "ab-commercial-gallery-banner-ads-variant",
  description = "Users in this test will see banner ads in galleries",
  owners = Seq(Owner.withGithub("JonNorman")),
  sellByDate = new LocalDate(2017, 7, 18)
) {

  def participationGroup(implicit request: RequestHeader): Option[String] = request.headers.get("X-GU-ab-commercial-gallery-banner-ads")

  def canRun(implicit request: RequestHeader): Boolean = participationGroup.contains("variant")
}

object CommercialGalleryBannerAdsControl extends TestDefinition(
  name = "ab-commercial-gallery-banner-ads-control",
  description = "Users in this test will not see banner ads in galleries, as a control.",
  owners = Seq(Owner.withGithub("JonNorman")),
  sellByDate = new LocalDate(2017, 7, 18)
) {

  def participationGroup(implicit request: RequestHeader): Option[String] = request.headers.get("X-GU-ab-commercial-gallery-banner-ads")

  def canRun(implicit request: RequestHeader): Boolean = participationGroup.contains("control")
}

object CommercialClientLoggingVariant extends TestDefinition(
  name = "commercial-client-logging",
  description = "A slice of the audience who will post their commercial js performance data",
  owners = Seq(Owner.withGithub("rich-nguyen")),
  sellByDate = new LocalDate(2018, 2, 1)
  ) {

  def participationGroup(implicit request: RequestHeader): Option[String] = request.headers.get("X-GU-ccl")

  def canRun(implicit request: RequestHeader): Boolean = participationGroup.contains("ccl-A")
}

object ABNewDesktopHeaderVariant extends TestDefinition(
  name = "ab-new-desktop-header-variant",
  description = "Users in this test will see the new desktop design.",
  owners = Seq(Owner.withGithub("natalialkb"), Owner.withGithub("gustavpursche")),
  sellByDate = new LocalDate(2017, 7, 18)
) {

  def participationGroup(implicit request: RequestHeader): Option[String] = request.headers.get("X-GU-ab-new-desktop-header")

  def canRun(implicit request: RequestHeader): Boolean = participationGroup.contains("variant")
}

object ABNewDesktopHeaderControl extends TestDefinition(
  name = "ab-new-desktop-header-control",
  description = "Users in this test will not see the new desktop design, but act as a control group",
  owners = Seq(Owner.withGithub("natalialkb"), Owner.withGithub("gustavpursche")),
  sellByDate = new LocalDate(2017, 7, 18)
) {

  def participationGroup(implicit request: RequestHeader): Option[String] = request.headers.get("X-GU-ab-new-desktop-header")

  def canRun(implicit request: RequestHeader): Boolean = participationGroup.contains("control")
}

trait ServerSideABTests {
  val tests: Seq[TestDefinition]

  def getJavascriptConfig(implicit request: RequestHeader): String = {

    def testStatus(test: TestDefinition): String = {

      val safeName: String = CamelCase.fromHyphenated(test.name)

      test.participationGroup.fold(s""""$safeName"""") {
        participationGroup: String => s""""$safeName" : "$participationGroup""""
      }
    }

    tests
      .filter(_.isParticipating)
      .map { testStatus }
      .mkString(",")
  }
}

object ActiveTests extends ServerSideABTests {
  val tests: Seq[TestDefinition] = List(
    CommercialClientLoggingVariant,
    CommercialGalleryBannerAdsVariant,
    CommercialGalleryBannerAdsControl,
    ABNewDesktopHeaderVariant,
    ABNewDesktopHeaderControl
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
  def participationGroup(implicit request: RequestHeader): Option[String]

}
