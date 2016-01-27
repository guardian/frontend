package common

import conf.switches.{Expiry, Switches}
import mvt.MultiVariateTesting._
import mvt.{TestDefinition, MultiVariateTesting, Tests}
import org.joda.time.LocalDate
import org.scalatest.{Matchers, FlatSpec}
import test.TestRequest

class MultiVariateTestingTest extends FlatSpec with Matchers {

  conf.switches.Switches.ServerSideTests.switchOn

  "active mvt tests" should "not have duplicate variants" in {
    val variantsInUse = mvt.ActiveTests.tests.flatMap(_.variants)
    variantsInUse.size should equal (variantsInUse.distinct.size)
  }

  "a request with a valid test header" should "be assigned to the appropriate test" in {
    TestCases.test1.switch.switchOn
    val testRequest = TestRequest("/uk")
      .withHeaders(
        "X-GU-mvt-variant" -> "variant-2"
      )
    MultiVariateTesting.getVariant(testRequest) should be (Some(Variant2))
    TestCases.isParticipatingInATest(testRequest) should be (true)
    TestCases.getParticipatingTest(testRequest) should be (Some(TestCases.test1))
    TestCases.test1.switch.switchOff
  }

  "a request with an invalid test header" should "be ignored" in {
    val testRequest = TestRequest("/uk")
      .withHeaders(
        "X-GU-mvt-variant" -> "variant-invalid"
      )
    MultiVariateTesting.getVariant(testRequest) should be (None)
    TestCases.isParticipatingInATest(testRequest) should be (false)
    TestCases.getParticipatingTest(testRequest) should be (None)
  }

  "a test definition" should "have a default switch state to off" in {
    TestCases.test0.switch.isSwitchedOff should be (true)
  }

  object TestCases extends Tests {
    object test0 extends TestDefinition(
      List(Variant0),
      "test0",
      "an experiment test",
      new LocalDate(2100, 1, 1)

    )
    object test1 extends TestDefinition(
      List(Variant1, Variant2),
      "test1",
      "an experiment test",
      new LocalDate(2100, 1, 1)
    )

    val tests = List(test0, test1)
  }
}
