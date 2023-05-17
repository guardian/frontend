package football.implicits

import pa.{LineUpEvent, LineUpPlayer, LineUpTeam, MatchEvent, MatchEvents, Official, Player, Team}
import implicits.Football._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class FootballTest extends AnyFlatSpec with Matchers {

  "RichLineUpTeam getListOfPlayerAndSubstitutes" should "return the team substitutions" in {
    val eventsList = List(
      getMatchEvent(eventType = "substitution", teamID = "homeTeamId", players = List("4", "2")),
      getMatchEvent(eventType = "substitution", teamID = "homeTeamId", players = List("5", "3")),
    )
    val home = makeLineUpTeam("homeTeamId", "team1", homePlayers)
    val away = makeLineUpTeam("awayTeamId", "team2", awayPlayers)
    val result = home.getListOfPlayerAndSubstitutes(getMatchEvents(home, away, eventsList))

    result.get.size should be(2)
    result.get("2") should be("4")
    result.get("3") should be("5")
  }

  it should "return an empty list given no substitution occured for the relevant team" in {
    val eventsList = List(
      getMatchEvent(eventType = "random", teamID = "homeTeamId", players = List("2", "4")),
    )
    val home = makeLineUpTeam("homeTeamId", "team1", homePlayers)
    val away = makeLineUpTeam("awayTeamId", "team2", awayPlayers)
    val result = home.getListOfPlayerAndSubstitutes(getMatchEvents(home, away, eventsList))

    result.get.size should be(0)
  }

  it should "return None given a None for match events" in {
    val home = makeLineUpTeam("homeTeamId", "team1", homePlayers)
    val result = home.getListOfPlayerAndSubstitutes(None)

    result shouldBe None
  }

  "RichLineUpTeam allSubstitutes" should "return all substitutes players" in {
    val home = makeLineUpTeam("homeTeamId", "team1", homePlayers)

    val result = home.allSubstitutes

    result.length should be(2)
    result(0).id should be("4")
    result(1).id should be("5")
  }

  "Football getPlayerSubstitute" should "the substitute who replaced the given player" in {
    val playerAndSubstitute = Some(Map(("2", "5"), ("1", "4")))
    val substitutes = Seq(
      makeLineUpPlayer("4", "Alessandro", "Bastoni", true),
      makeLineUpPlayer("5", "Denzel", "Dumfries", true),
    )
    val player = makeLineUpPlayer("1", "Andre", "Onana", false)

    val result = getPlayerSubstitute(playerAndSubstitute, substitutes, player)

    result.get shouldEqual (substitutes(0))
  }

  it should "return None given player was not substituted" in {
    val playerAndSubstitute = Some(Map(("2", "5"), ("1", "4")))
    val substitutes = Seq(
      makeLineUpPlayer("4", "Alessandro", "Bastoni", true),
      makeLineUpPlayer("5", "Denzel", "Dumfries", true),
    )
    val player = makeLineUpPlayer("3", "Francesco", "Acerbi", false)

    val result = getPlayerSubstitute(playerAndSubstitute, substitutes, player)

    result shouldBe None
  }

  it should "return None given player substitute is not found in the list of all substitutes" in {
    val playerAndSubstitute = Some(Map(("2", "5"), ("1", "4")))
    val substitutes = Seq(
      makeLineUpPlayer("5", "Denzel", "Dumfries", true),
    )
    val player = makeLineUpPlayer("1", "Andre", "Onana", false)

    val result = getPlayerSubstitute(playerAndSubstitute, substitutes, player)

    result shouldBe None
  }

  val homePlayers = Seq(
    makeLineUpPlayer("1", "Andre", "Onana", false),
    makeLineUpPlayer("2", "Matteo", "Darmian", false),
    makeLineUpPlayer("3", "Francesco", "Acerbi", false),
    makeLineUpPlayer("4", "Alessandro", "Bastoni", true),
    makeLineUpPlayer("5", "Denzel", "Dumfries", true),
  )

  val awayPlayers = Seq(
    makeLineUpPlayer("1", "Nicolo", "Barella", false),
    makeLineUpPlayer("2", "Hakan", "Calhanoglu", false),
    makeLineUpPlayer("3", "Henrikh", "Mkhitaryan", false),
    makeLineUpPlayer("4", "Marcelo", "Brozovic", true),
    makeLineUpPlayer("5", "Federico", "Dimarco", true),
  )

  def getMatchEvents(home: LineUpTeam, away: LineUpTeam, events: List[MatchEvent]) = {
    Some(MatchEvents(getTeam(home), getTeam(away), events, true))
  }

  def getTeam(lineUpTeam: LineUpTeam): Team = Team(lineUpTeam.id, lineUpTeam.name)

  def getMatchEvent(eventType: String, teamID: String, players: List[String]) = {
    MatchEvent(
      id = Some("someId"),
      teamID = Some(teamID),
      eventType = eventType,
      matchTime = None,
      eventTime = None,
      addedTime = None,
      players = players.map(p => Player(id = p, teamID = "teamId", name = "playerName")),
      reason = None,
      how = None,
      whereFrom = None,
      whereTo = None,
      distance = None,
      outcome = None,
    )
  }

  def makeLineUpTeam(id: String, name: String, players: Seq[LineUpPlayer]) = {
    LineUpTeam(
      id = id,
      name = name,
      teamColour = "blue",
      manager = Official("officialId", "officialName"),
      formation = "formation",
      shotsOn = 1,
      shotsOff = 1,
      fouls = 1,
      corners = 1,
      offsides = 1,
      bookings = 1,
      dismissals = 1,
      players = players,
    )
  }

  def makeLineUpPlayer(id: String, firstName: String, lastName: String, substitute: Boolean = false) = {
    LineUpPlayer(
      id = id,
      name = s"${firstName} ${lastName}",
      firstName = firstName,
      lastName = lastName,
      shirtNumber = "1",
      position = "position",
      substitute = substitute,
      rating = Some(1),
      timeOnPitch = "20",
      events = Seq[LineUpEvent](),
    )
  }
}
