package mvt

import org.joda.time.LocalDate
import org.scalatest.{Matchers, FlatSpec}
import test.TestRequest

class MultiVariateTestingTest extends FlatSpec with Matchers {

  conf.switches.Switches.ServerSideTests.switchOn

  "active mvt tests" should "not have duplicate variants" in {
    val variantsInUse = mvt.ActiveTests.tests.flatMap(_.variants)
    variantsInUse.size should equal (variantsInUse.distinct.size)
  }

  // TODO: refactor MultiVariateTesting to remove site-wide variants
  // This test is only here to ensure nobody adds variants by accident before this refactoring happens
  // Talk to Thomas Bonnin if you have any question
  "MultiVariateTesting" should "have no variant" in {
    MultiVariateTesting.allVariants.size should equal (0)
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
      Nil,
      "test0",
      "an experiment test",
      new LocalDate(2100, 1, 1)

    )
    object test1 extends TestDefinition(
      Nil,
      "test1",
      "an experiment test",
      new LocalDate(2100, 1, 1)
    )

    val tests = List(test0, test1)
  }
}
