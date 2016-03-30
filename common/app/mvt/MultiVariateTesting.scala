package mvt

import MultiVariateTesting._
import common.InternationalEditionVariant
import conf.switches.Switch
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

object CMTopBannerPosition extends TestDefinition(
  List(Variant1),
  "cm-top-banner-position",
  "Test viewability and revenue changes when top banner is moved below first container on fronts and removed from articles",
  new LocalDate(2016, 4, 28)
)

object ABHeadlinesTestVariant extends TestDefinition(
  Nil,
  "headlines-ab-variant",
  "To test how much of a difference changing a headline makes (variant group)",
  new LocalDate(2016, 4, 30)
  ) {
  override def isParticipating(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-hlt").contains("hlt-V") && switch.isSwitchedOn && ServerSideTests.isSwitchedOn
    }
}

object ABHeadlinesTestControl extends TestDefinition(
  Nil,
  "headlines-ab-control",
  "To test how much of a difference changing a headline makes (control group)",
  new LocalDate(2016, 4, 30)
  ) {
  override def isParticipating(implicit request: RequestHeader): Boolean = {
      request.headers.get("X-GU-hlt").contains("hlt-C") && switch.isSwitchedOn && ServerSideTests.isSwitchedOn
    }
}

object SeriesOnwardPosition extends TestDefinition(
  List(Variant2, Variant3, Variant4, Variant5, Variant6), // 5% of our audience
  "series-onward-position",
  "Test engagement with the series onward container positioned as the first thing after the article",
  new LocalDate(2016, 4, 11)) {
    def isParticipating(request: RequestHeader, content: model.ContentType): Boolean = {
      content.tags.series.nonEmpty && super.isParticipating(request)
    }
}

object ActiveTests extends Tests {
  val tests: Seq[TestDefinition] = List(CMTopBannerPosition, ABHeadlinesTestControl, ABHeadlinesTestVariant, SeriesOnwardPosition)

  def getJavascriptConfig(implicit request: RequestHeader): String = {

    val headlineTests = List(ABHeadlinesTestControl, ABHeadlinesTestVariant).filter(_.isParticipating)
                          .map{ test => s""""${CamelCase.fromHyphenated(test.name)}" : ${test.switch.isSwitchedOn}"""}

    val internationalEditionTests = List(InternationalEditionVariant(request)
                                      .map{ international => s""""internationalEditionVariant" : "$international" """}).flatten

    val activeTest = List(ActiveTests.getParticipatingTest(request)
                        .map{ test => s""""${CamelCase.fromHyphenated(test.name)}" : ${test.switch.isSwitchedOn}"""}).flatten

    val configEntries = activeTest ++ internationalEditionTests ++ headlineTests

    configEntries.mkString(",")
  }
}

case class TestDefinition (
  variants: Seq[Variant],
  name: String,
  description: String,
  sellByDate: LocalDate
) {
  val switch: Switch = Switch(
    "Server-side A/B Tests",
    name,
    description,
    conf.switches.Off,
    sellByDate,
    exposeClientSide = true
  )

  def isParticipating(implicit request: RequestHeader): Boolean = {
    ActiveTests.getParticipatingTest(request).contains(this)
  }
}

trait Tests {

  protected def tests: Seq[TestDefinition]

  def getParticipatingTest(request: RequestHeader): Option[TestDefinition] = {
    getVariant(request).flatMap { variant =>
      tests.find { test =>
        test.variants.contains(variant) &&
        test.switch.isSwitchedOn &&
        ServerSideTests.isSwitchedOn
      }
    }
  }

  def isParticipatingInATest(request: RequestHeader): Boolean = getParticipatingTest(request).isDefined
}

object MultiVariateTesting {

  sealed case class Variant(name: String)

  object Variant0 extends Variant("variant-0")
  object Variant1 extends Variant("variant-1")
  object Variant2 extends Variant("variant-2")
  object Variant3 extends Variant("variant-3")
  object Variant4 extends Variant("variant-4")
  object Variant5 extends Variant("variant-5")
  object Variant6 extends Variant("variant-6")
  object Variant7 extends Variant("variant-7")
  object Variant8 extends Variant("variant-8")
  object Variant9 extends Variant("variant-9")

  private val allVariants = List(
    Variant0, Variant1, Variant2, Variant3, Variant4,
    Variant5, Variant6, Variant7, Variant8, Variant9)

  def getVariant(request: RequestHeader): Option[Variant] = {
    val cdnVariant: Option[String] = request.headers.get("X-GU-mvt-variant")

    cdnVariant.flatMap( variantName => {
      allVariants.find(_.name == variantName)
    })
  }
}
