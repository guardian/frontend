package rugby.model

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import rugby.feed.{JsonParseException, PAMatchesResponse}

import scala.io.Source
import scala.util.Try

class PAMatchParserTest extends AnyFlatSpec with Matchers {

  behavior of "PA Match parser"

  it should "parse a PA events response" in {
    val json = Source
      .fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/pa-events.json"))
      .mkString

    checkJsonResult(PAMatchesResponse.fromJSON(json))
  }

  def checkJsonResult[A](res: Try[A]): Unit = {
    val clue = res.failed.toOption
      .collect {
        case JsonParseException(msg) => msg
      }
      .getOrElse("")

    withClue(clue) {
      res.isSuccess shouldBe true
    }
  }
}
