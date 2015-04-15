package mvt

import MultiVariateTesting._
import conf.{Switches, Switch}
import org.joda.time.LocalDate
import play.api.mvc.RequestHeader

object ActiveTests extends Tests {
  object Test0 extends TestDefinition(
    List(Variant9),
    "Test0",
    "an experiment test",
    Switches.never
  )

  val tests = List(Test0)
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
}

trait Tests {

  protected def tests: Seq[TestDefinition]

  def getTest(request: RequestHeader): Option[TestDefinition] = {
    getVariant(request).flatMap { variant =>
      tests.find(_.variants.contains(variant))
    }
  }

  def isPartOfATest(request: RequestHeader): Boolean = {
    getTest(request).exists(_.switch.isSwitchedOn && conf.Switches.ServerSideTests.isSwitchedOn)
  }
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
