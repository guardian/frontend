package rugby.feed

import org.joda.time.DateTime
import org.scalatest.flatspec.AsyncFlatSpec
import org.scalatest.matchers.should.Matchers
import rugby.model.{Match, Stage, Status, Team}

import scala.concurrent.{ExecutionContext, Future}
import scala.io.Source
import scala.util.{Failure, Success, Try}

class PAFeedTest extends AsyncFlatSpec with Matchers {

  behavior of "PA rugby feed"

  val feed = new PARugbyFeed(rugbyClient = StubClient)

  val exampleMatch = Match(
    date = DateTime.parse("2019-08-29T07:35:00Z"),
    id = "3000315",
    homeTeam = Team(
      id = "10406409",
      name = "Wellington",
    ),
    awayTeam = Team(
      id = "10406409",
      name = "Wellington",
    ),
    venue = None,
    competitionName = "New Zealand Mitre 10 Cup",
    status = Status.Result,
    event = WorldCup2019,
    stage = Stage.Group,
  )

  // Note, this is lightweight; detailed testing of deserialisation
  // happens in PAMMatchParserTest.

  it should "get live scores" in {
    val liveGames = feed.getLiveScores()
    liveGames.map(matches => matches.size shouldBe 0)
  }

  it should "get fixtures and results" in {
    val games = feed.getFixturesAndResults()
    games.map(matches => matches.size shouldBe 1)
  }
}

object StubClient extends RugbyClient {

  private[this] def loadJSON(path: String): String = {
    Source
      .fromInputStream(getClass.getClassLoader.getResourceAsStream(path))
      .mkString
  }

  private[this] val store = Map(
    s"events/${WorldCupPAIDs.worldCup2019SeasonID}" -> loadJSON("rugby/feed/pa-events.json"),
  )

  private[this] def toFut[A](t: Try[A]): Future[A] =
    t match {
      case Success(value)     => Future.successful(value)
      case Failure(exception) => Future.failed(exception)
    }

  override def getEvents(seasonID: Int)(implicit executionContext: ExecutionContext): Future[List[PAMatch]] = {

    store.get(s"events/$seasonID") match {
      case Some(json) =>
        toFut(PAMatchesResponse.fromJSON(json)).map(_.items)
      case None =>
        Future.failed(new Exception("Item not found"))
    }
  }
}
