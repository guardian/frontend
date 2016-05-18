package mvt

import MultiVariateTesting._
import common.InternationalEditionVariant
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
  Nil,
  "headlines-ab-variant",
  "To test how much of a difference changing a headline makes (variant group)",
  new LocalDate(2016, 6, 10)
  ) {
  override def isParticipating(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-hlt").contains("hlt-V") && switch.isSwitchedOn && ServerSideTests.isSwitchedOn
    }
}

object ABNewHeaderVariant extends TestDefinition(
  variants = Nil,
  name = "ab-new-header-variant",
  description = "Feature switch (0% test) for the new header",
  sellByDate = new LocalDate(2016, 6, 14)
) {
  override def isParticipating(implicit request: RequestHeader): Boolean = {
    request.headers.get("X-GU-ab-new-header").contains("variant") && switch.isSwitchedOn && ServerSideTests.isSwitchedOn
  }
}

object ABHeadlinesTestControl extends TestDefinition(
  Nil,
  "headlines-ab-control",
  "To test how much of a difference changing a headline makes (control group)",
  new LocalDate(2016, 6, 10)
  ) {
  override def isParticipating(implicit request: RequestHeader): Boolean = {
      request.headers.get("X-GU-hlt").contains("hlt-C") && switch.isSwitchedOn && ServerSideTests.isSwitchedOn
    }
}

object ABIntersperseMultipleStoryPackagesStories extends TestDefinition(
  List(Variant8), // 1% of our audience
  "intersperse-multiple-story-packages-stories",
  "To test if mixing storyPackages stories (when article has more than one storyPackage) results in more clicks",
  new LocalDate(2016, 5, 24)
)
object ABIntersperseMultipleStoryPackagesStoriesControl extends TestDefinition(
  List(Variant9), // 1% of our audience
  "intersperse-multiple-story-packages-stories-control",
  "Control for the intersperse-multiple-story-packages-stories A/B test",
  new LocalDate(2016, 5, 24)
)

object ActiveTests extends Tests {
  val tests: Seq[TestDefinition] = List(
    ABNewHeaderVariant,
    ABHeadlinesTestControl,
    ABHeadlinesTestVariant,
    ABIntersperseMultipleStoryPackagesStories,
    ABIntersperseMultipleStoryPackagesStoriesControl
  )

  def getJavascriptConfig(implicit request: RequestHeader): String = {

    val headlineTests = List(ABHeadlinesTestControl, ABHeadlinesTestVariant).filter(_.isParticipating)
                          .map{ test => s""""${CamelCase.fromHyphenated(test.name)}" : ${test.switch.isSwitchedOn}"""}
    val newHeaderTests = List(ABNewHeaderVariant).filter(_.isParticipating)
                          .map{ test => s""""${CamelCase.fromHyphenated(test.name)}" : ${test.switch.isSwitchedOn}"""}
    val internationalEditionTests = List(InternationalEditionVariant(request)
                                      .map{ international => s""""internationalEditionVariant" : "$international" """}).flatten

    val activeTest = List(ActiveTests.getParticipatingTest(request)
                        .map{ test => s""""${CamelCase.fromHyphenated(test.name)}" : ${test.switch.isSwitchedOn}"""}).flatten

    val configEntries = activeTest ++ internationalEditionTests ++ headlineTests ++ newHeaderTests

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
    SwitchGroup.ServerSideABTests,
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

  // buckets 0-7 are removed because they cost $1000+ just in aws bandwidth every month, the rest
  // will be removed once they're not in use.  In future server side ab tests will be added explicitly
  // to target only the URLs needed for the time needed.
  object Variant8 extends Variant("variant-8")
  object Variant9 extends Variant("variant-9")

  private val allVariants = List(
    Variant8, Variant9)

  def getVariant(request: RequestHeader): Option[Variant] = {
    val cdnVariant: Option[String] = request.headers.get("X-GU-mvt-variant")

    cdnVariant.flatMap( variantName => {
      allVariants.find(_.name == variantName)
    })
  }
}
