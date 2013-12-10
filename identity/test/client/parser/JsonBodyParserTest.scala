package client.parser

import org.scalatest.path
import net.liftweb.json.JsonAST.{JString, JValue}
import client.Error
import client.connection.HttpResponse
import org.scalatest.Matchers
import net.liftweb.json.{DefaultFormats, Formats}


class JsonBodyParserTest extends path.FreeSpec with Matchers {
  case class TestType(test: String)

  val testErrors = List(Error("Test error", "Test description"))
  val validJSONResponse = HttpResponse("""{"test": "value"}""", 200, "OK")
  val invalidJSONResponse = HttpResponse("""Not valid JSON""", 200, "OK")
  val badTypeJSONResponse = HttpResponse("""{"anotherKey": "some value"}""", 200, "OK")
  val errorJSONResponse = HttpResponse(""""error body"""", 500, "Internal server error")
  val emptyResponse = HttpResponse("""{}""", 200, "OK")

  object TestJsonBodyParser extends JsonBodyParser {

    implicit val formats = new DefaultFormats {}

    def extractErrorFromResponse(json: JValue, statusCode: Int): List[Error] = testErrors
  }

  "The extract method" - {
    "returns a parse error if the JSON is not valid" in {
      TestJsonBodyParser.extract[TestType]()(Right(invalidJSONResponse)) match {
        case Right(result) => fail("extractJsonOrError did not return a Left, got %s".format(result.toString))
        case Left(errors) => errors(0) should have('message("JSON parsing exception"))
      }
    }

    "if the response is an error, should extract the error response" in {
      TestJsonBodyParser.extract[TestType]()(Right(errorJSONResponse)) match {
        case Right(result) => fail("extractJsonOrError did not return a Left, got %s".format(result.toString))
        case Left(errors) => errors should be(testErrors)
      }
    }

    "extracts the provided type from the JSON body of a successful response" in {
      TestJsonBodyParser.extract[TestType]()(Right(validJSONResponse)) match {
        case Left(result) =>  fail("extract did not return a Right, got Left(%s)".format(result.toString()))
        case Right(testObject: TestType) => testObject should have('test("value"))
        case Right(result) => fail("extract did not return a Right of the required type, got a %s".format(result.getClass.getName))
      }
    }

    "if the response is an error, should extract the error response for a unit response" in {
      TestJsonBodyParser.extract[Unit]()(Right(errorJSONResponse)) match {
        case Right(result) => fail("extractJsonOrError did not return a Left, got %s".format(result.toString))
        case Left(errors) => errors should be(testErrors)
      }
    }

    "extracts the provided type from the JSON body of a successful unit response" in {
      TestJsonBodyParser.extract[Unit]()(Right(emptyResponse)) match {
        case Left(result) =>  fail("extract did not return a Right, got Left(%s)".format(result.toString()))
        case Right(testObject: Unit) => //good
      }
    }

    "returns a mapping error if the provided type cannot be extracted from the response" in {
      TestJsonBodyParser.extract[TestType]()(Right(badTypeJSONResponse)) match {
        case Right(result) => fail("extract did not return a Left, got %s".format(result.toString))
        case Left(errors) => errors(0).message should startWith("JSON mapping exception")
      }
    }

    "passes an existing Left seamlessly" in {
      TestJsonBodyParser.extract[TestType]()(Left(testErrors)) match {
        case Right(result) => fail("extract did not return a Left, got %s".format(result.toString))
        case Left(errors) => errors should be(testErrors)
      }
    }

  }
}
