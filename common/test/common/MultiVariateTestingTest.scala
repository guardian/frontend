package mvt

import org.joda.time.LocalDate
import org.scalatest.{FlatSpec, Matchers}
import play.api.mvc.RequestHeader
import test.TestRequest

class MultiVariateTestingTest extends FlatSpec with Matchers {

  conf.switches.Switches.ServerSideTests.switchOn

  "a test definition" should "have a default switch state to off" in {
    TestCases.test0.switch.isSwitchedOff should be (true)
  }

  "A test definition" should "know if a given request is participating" in EnabledTests {
    val testRequest = TestRequest("/uk")
      .withHeaders(
        "X-GU-Test1" -> "test1variant"
      )
    TestCases.test0.isParticipating(testRequest) should be (true)
    TestCases.test1.isParticipating(testRequest) should be (true)
    TestCases.test2.isParticipating(testRequest) should be (false)
  }

  "ActiveTests" should "returns proper javascript config" in EnabledTests {
    object AllAbTests extends ServerSideABTests {
      val tests: Seq[TestDefinition] = TestCases.tests
    }
    val testRequest = TestRequest("/myPage")
      .withHeaders(
        "X-GU-Test2" -> "test2variant"
      )
    val jsConfig = AllAbTests.getJavascriptConfig(testRequest)
    jsConfig should be("\"test0\" : true,\"test2\" : true")

  }

  object TestCases {
    object test0 extends TestDefinition(
      "test0",
      "an experiment test",
      new LocalDate(2100, 1, 1)
    )
    object test1 extends TestDefinition(
      "test1",
      "another experiment test",
      new LocalDate(2100, 1, 1)
    ) {
      override def isParticipating(implicit request: RequestHeader): Boolean = {
        request.headers.get("X-GU-Test1").contains("test1variant") && super.isParticipating(request)
      }
    }
    object test2 extends TestDefinition(
      "test2",
      "still another experiment test",
      new LocalDate(2100, 1, 1)
    ) {
      override def isParticipating(implicit request: RequestHeader): Boolean = {
        request.headers.get("X-GU-Test2").contains("test2variant") && super.isParticipating(request)
      }
    }

    val tests = List(test0, test1, test2)
  }

  trait EnabledTests {

    def apply[T](block: => T): T = {
      TestCases.tests.foreach(_.switch.switchOn)
      val result = block
      TestCases.tests.foreach(_.switch.switchOff)
      result
    }
  }

  object EnabledTests extends EnabledTests
}
