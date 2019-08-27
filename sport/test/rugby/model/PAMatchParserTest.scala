package rugby.model

import org.scalatest.{FlatSpec, Matchers}
import rugby.feed.{JsonParseException, PAEvent, PAMatchesResponse, PATableResponse}

import scala.io.Source
import scala.util.Try

class PAMatchParserTest extends FlatSpec with Matchers {

  behavior of "PA Match parser"

  it should "parse a PA events response" in {
    val json = Source
      .fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/pa-events.json"))
      .mkString

    checkJsonResult(PAMatchesResponse.fromJSON(json))
  }

  it should "parse a PA standings (tables) response" in {
    val json = Source
      .fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/pa-standing.json"))
      .mkString

    checkJsonResult(PATableResponse.fromJSON(json))
  }

  it should "parse a PA event actions response" in {
    val json = Source
      .fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/pa-event-actions.json"))
      .mkString

    checkJsonResult(PAEvent.fromJSONList(json))
  }

  def checkJsonResult[A](res: Try[A]): Unit = {
    val clue = res.failed.toOption.collect {
      case JsonParseException(msg) => msg
    }.getOrElse("")

    withClue(clue) {
      res.isSuccess shouldBe true
    }
  }
}
