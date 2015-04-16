package mvt

import MultiVariateTesting._
import common.InternationalEditionVariant
import conf.Switch
import org.joda.time.LocalDate
import play.api.mvc.RequestHeader
import views.support.CamelCase

object ChimneyTest extends TestDefinition(
  List(Variant9, Variant8),
  "chimney-test",
  "an example test that adds a chimney to the home icon",
  new LocalDate(2015, 4, 30)
)

object ActiveTests extends Tests {
  val tests = List(ChimneyTest)

  def getJavascriptConfig(implicit request: RequestHeader): String = {
    val configEntries = List(InternationalEditionVariant(request).map{ international => s""""internationalEditionVariant" : "$international" """}) ++
    List(ActiveTests.getParticipatingTest(request).map{ test => s""""${CamelCase.fromHyphenated(test.name)}" : ${test.switch.isSwitchedOn}"""})
    configEntries.flatten.mkString(",")
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
    conf.Off,
    sellByDate)

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
        conf.Switches.ServerSideTests.isSwitchedOn
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
