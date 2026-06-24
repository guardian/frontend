package test

import conf.{FootballClient}
import scala.concurrent.{Await, Future}
import feed.CompetitionsService
import model.Competition
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.concurrent.{Eventually, ScalaFutures}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.time.{Millis, Span}
import test.FootballTestData.{fixture, liveMatch, result}
import pa.{MatchDay, Result}

import java.time.{Clock, LocalDate, ZonedDateTime}
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import scala.concurrent.duration._

@DoNotDiscover class CompetitionAgentTest
    extends AnyFlatSpec
    with ConfiguredTestSuite
    with Matchers
    with implicits.Football
    with Eventually
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestFootballClient
    with FootballTestData
    with WithTestExecutionContext
    with ScalaFutures {

  val fixedClock = {
    val fixedDate = ZonedDateTime.of(2016, 6, 22, 15, 0, 0, 0, ZoneId.systemDefault()).toInstant
    Clock.fixed(fixedDate, ZoneId.systemDefault())
  }

  override def afterAll(): Unit = {
    super.afterAll()
  }

  override implicit val patienceConfig: PatienceConfig =
    PatienceConfig(timeout = scaled(Span(3000, Millis)), interval = scaled(Span(100, Millis)))

  lazy val seasonStart = Some(LocalDate.of(2012, 8, 1))

  def testCompetitionsService(competition: Competition): CompetitionsService =
    new CompetitionsService(testFootballClient, Seq(competition))

  def testCompetitionsServiceWithCustomClient(
      competition: Competition,
      getResponse: String => Future[pa.Response],
  ): CompetitionsService = {
    val stubClient = new FootballClient(wsClient) {
      override def GET(url: String): Future[pa.Response] = getResponse(url)
    }
    new CompetitionsService(stubClient, Seq(competition))
  }

  "CompetitionAgentTest" should "load fixtures" in {

    val comps = testCompetitionsService(
      Competition(
        "100",
        "/football/premierleague",
        "Premier League",
        "Premier League",
        "English",
        showInTeamsList = true,
      ),
    )
    comps.competitionAgents.foreach(_.refreshFixtures())

    eventually(
      comps.matches.filter(_.isFixture).map(_.id) should contain("3925232"),
    )
  }

  it should "load results" in {

    val comps = testCompetitionsService(
      Competition(
        "100",
        "/football/premierleague",
        "Premier League",
        "Premier League",
        "English",
        showInTeamsList = true,
        startDate = seasonStart,
      ),
    )
    comps.competitionAgents.foreach(_.refreshResults(fixedClock))

    eventually(
      comps.matches.filter(_.isResult).map(_.id) should contain("3528302"),
    )
  }

  it should "load live matches" in {

    val comps = testCompetitionsService(
      Competition("101", "/football/championship", "Championship", "Championship", "English", showInTeamsList = true),
    )
    whenReady(comps.refreshMatchDay(fixedClock)) { _ =>
      comps.matches.filter(_.isLive).map(_.id) should be(List()) // well, it's off season now...
    }

  }

  def testCompetitionsServiceWithMatchDayResponses(
      competition: Competition,
      todayMatches: Seq[MatchDay],
      yesterdayMatches: Seq[MatchDay],
  ): CompetitionsService = {
    testCompetitionsServiceWithCustomClient(
      competition,
      url => {
        val fmt = DateTimeFormatter.ofPattern("yyyyMMdd")
        val today = LocalDate.now(fixedClock)
        val yesterday = today.minusDays(1)
        if (url.contains(today.format(fmt))) {
          Future.successful(pa.Response(200, matchDayXml(competition.id, competition.fullName, todayMatches), "ok"))
        } else if (url.contains(yesterday.format(fmt))) {
          Future.successful(pa.Response(200, matchDayXml(competition.id, competition.fullName, yesterdayMatches), "ok"))
        } else {
          testFootballClient.GET(url)
        }
      },
    )
  }

  // ...existing code...

  it should "load live matches from yesterday that haven't yet finished" in {

    val yesterdayFirstMatchDate = ZonedDateTime.of(2016, 6, 21, 15, 30, 0, 0, ZoneId.of("Europe/London"))
    val yesterdaySecondMatchDate = ZonedDateTime.of(2016, 6, 21, 22, 0, 0, 0, ZoneId.of("Europe/London"))
    val todayMatchDate = ZonedDateTime.of(2016, 6, 22, 20, 0, 0, 0, ZoneId.of("Europe/London"))

    val runningMatch =
      liveMatch("Southampton", "Millwall", Some(1), Some(1), yesterdaySecondMatchDate, isLive = true, isResult = false)
    val resultMatch = result("Hull", "Middlesbrough", 1, 0, yesterdayFirstMatchDate)

    val competition = Competition(
      "101",
      "/football/championship",
      "Championship",
      "Championship",
      "English",
      showInTeamsList = true,
      matches = Seq(resultMatch, runningMatch),
    )
    val fixtureMatchDay = liveMatch("Millwall", "Hull", None, None, todayMatchDate, isLive = false, isResult = false)

    val compService = testCompetitionsServiceWithMatchDayResponses(
      competition,
      todayMatches = Seq(fixtureMatchDay),
      yesterdayMatches = Seq(
        liveMatch("Hull", "Middlesbrough", Some(1), Some(1), yesterdayFirstMatchDate, isLive = false, isResult = true),
        runningMatch.copy(homeTeam = runningMatch.homeTeam.copy(score = Some(2))),
      ),
    )

    whenReady(compService.refreshMatchDay(fixedClock)) { _ =>
      compService.matches.length should be(3)

      val resultMatch = compService.matches(0)
      resultMatch shouldBe a[Result]
      resultMatch.id should be(resultMatch.id)

      val liveMatch = compService.matches(1)
      liveMatch shouldBe a[MatchDay]
      liveMatch.id should be(runningMatch.id)
      liveMatch.homeTeam.score should be(Some(2))

      val fixtureMatch = compService.matches(2)
      fixtureMatch shouldBe a[MatchDay]
      fixtureMatch.id should be(fixtureMatchDay.id)
    }
  }

  it should "load league tables" in {

    val comps = testCompetitionsService(
      Competition(
        "100",
        "/football/premierleague",
        "Premier League",
        "Premier League",
        "English",
        showInTeamsList = true,
      ),
    )
    comps.competitionAgents.foreach(_.refresh(fixedClock))

    eventually(comps.competitions(0).leagueTable(0).team.id should be("23"))
  }

  it should "not contain matches with known opponents as placeholders" in {
    val date1 = ZonedDateTime.of(2022, 12, 9, 15, 0, 0, 0, ZoneId.of("Europe/London"))
    val date2 = ZonedDateTime.of(2022, 12, 10, 15, 0, 0, 0, ZoneId.of("Europe/London"))
    val placeHolderMatches =
      Seq(fixture("Wnr Gp E/R-Up Gp F", "Wnr Gp G/R-Up Gp H", date1), fixture("Winner Q/F 3", "Winner Q/F 4", date2))

    val comps = testCompetitionsService(
      Competition(
        "700",
        "/football/world-cup-2022",
        "World Cup 2022",
        "World Cup 2022",
        "Internationals",
        showInTeamsList = true,
        tableDividers = List(2),
        matches = placeHolderMatches,
      ),
    )

    val competitionAgent = comps.competitionAgents.head

    assert(competitionAgent.competition.matches.length === 2)
    assert(competitionAgent.competition.matches.contains(placeHolderMatches.head))
    assert(competitionAgent.competition.matches.contains(placeHolderMatches(1)))

    val matchesWithKnownOpponents = Seq(fixture("Brazil", "Croatia", date1), fixture("Spain", "Portugal", date2))
    Await.result(competitionAgent.addMatches(matchesWithKnownOpponents), 2.second)

    assert(competitionAgent.competition.matches.length === 2)
    assert(competitionAgent.competition.matches.contains(matchesWithKnownOpponents.head))
    assert(competitionAgent.competition.matches.contains(matchesWithKnownOpponents(1)))
  }

  it should "still contain placeholder matches with unknown opponents" in {
    val firstGameDate = ZonedDateTime.of(2022, 12, 10, 15, 0, 0, 0, ZoneId.of("Europe/London"))
    val secondGameDate = ZonedDateTime.of(2022, 12, 10, 19, 0, 0, 0, ZoneId.of("Europe/London"))

    val firstPlaceHolderMatch =
      fixture("Winner Group F/Runner-Up Group E", "Winner Group H/Runner-Up Group G", firstGameDate)
    val secondPlaceHolderMatch =
      fixture("Winner Group B/Runner-Up Group A", "Winner Group D/Runner-Up Group C", secondGameDate)
    val matchWithKnownOpponents = fixture("England", "France", secondGameDate)

    val comps = testCompetitionsService(
      Competition(
        "700",
        "/football/world-cup-2022",
        "World Cup 2022",
        "World Cup 2022",
        "Internationals",
        showInTeamsList = true,
        tableDividers = List(2),
        matches = Seq(firstPlaceHolderMatch, secondPlaceHolderMatch),
      ),
    )

    val competitionAgent = comps.competitionAgents.head

    Await.result(competitionAgent.addMatches(Seq(matchWithKnownOpponents)), 2.second)

    assert(competitionAgent.competition.matches.length === 2)
    assert(competitionAgent.competition.matches.contains(firstPlaceHolderMatch))
    assert(competitionAgent.competition.matches.contains(matchWithKnownOpponents))

  }

//  case class PAMatchDayData(matchId: String, homeTeam: String, awayTeam: String, isLive: Boolean, date: ZonedDateTime)
  def matchDayXml(competitionId: String, competitionName: String, matches: Seq[MatchDay]): String = {
    val dateFmt = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")
    val timeFmt = java.time.format.DateTimeFormatter.ofPattern("HH:mm")

    val matchElements = matches.map { theMatch =>
      val live = if (theMatch.liveMatch) "Yes" else "No"
      val result = if (theMatch.result) "Yes" else "No"
      val date = theMatch.date.format(dateFmt)
      val koTime = theMatch.date.format(timeFmt)
      val homeScore = theMatch.homeTeam.score.getOrElse(0)
      val awayScore = theMatch.awayTeam.score.getOrElse(0)
      s"""<match matchID="${theMatch.id}" date="$date" koTime="$koTime"><competition competitionID="$competitionId" seasonID="6100">$competitionName</competition><stage stageNumber="1" stageType="League"></stage><round roundNumber="1">Regular Season</round><leg>1</leg><liveMatch>$live</liveMatch><result>$result</result><previewAvailable>Yes</previewAvailable><reportAvailable>Yes</reportAvailable><lineupsAvailable>Yes</lineupsAvailable><homeTeam teamID="${theMatch.homeTeam.id}"><teamName>${theMatch.homeTeam.name}</teamName><score>$homeScore</score><htScore>0</htScore><aggregateScore></aggregateScore><scorers><![CDATA[]]></scorers></homeTeam><awayTeam teamID="${theMatch.awayTeam.id}"><teamName>${theMatch.awayTeam.name}</teamName><score>$awayScore</score><htScore>0</htScore><aggregateScore></aggregateScore><scorers><![CDATA[]]></scorers></awayTeam><comments></comments></match>"""
    }.mkString
    s"""<?xml version="1.0" encoding="utf-8"?><matches>$matchElements</matches>"""
  }
}
