package football.model

import org.joda.time.{Interval, DateTime}
import feed.Competitions
import model.Competition
import pa._
import implicits.Football._


trait CompetitionStage {
  val matches: List[FootballMatch]
  def roundMatches(round: Round): List[FootballMatch] = matches.filter(_.round == round)
}
object CompetitionStage {

  def stagesFromCompetition(competition: Competition): List[CompetitionStage] = {
    val stagesWithMatches = competition.matches.groupBy(_.stage).toList
    val allStagesHaveStarted = stagesWithMatches.forall { case (_, matches) => matches.exists(_.hasStarted) }

    // if all stages have started, reverse order (typically at most two stages so means "show most recent first")
    val sortedStagesWithMatches =
      if (allStagesHaveStarted) stagesWithMatches.reverse
      else stagesWithMatches

    sortedStagesWithMatches.flatMap { case (stage, stageMatches) =>
      // work out stage type
      val stageLeagueEntries = competition.leagueTable.filter(_.stageNumber == stage.stageNumber)
      val rounds = stageMatches.map(_.round).distinct.sortBy(_.roundNumber)

      if (stageLeagueEntries.isEmpty) {
        if (rounds.size > 1) {
          KnockoutSpider.orderings.get(competition.id).map { matchDates =>
            // TODO: PA will be "postponing" matches in the world cup to turn "winner group A" teams into real nation teams
            // add filtering when PA get back to us with an example
            KnockoutSpider(stageMatches, rounds, matchDates)
          }.orElse(Some(KnockoutList(stageMatches, rounds)))
        } else None  // or just a collection of matches (e.g. international friendlies)
      } else {
        if (rounds.size > 1) {
          // multiple rounds and league table entries is a group stage
          val groupTables = stageLeagueEntries.groupBy(_.round).toList.sortBy(_._1.roundNumber)
          Some(Groups(stageMatches, groupTables))
        } else if (rounds.size == 1) {
          // single round with table is league
          rounds.headOption.map(League(stageMatches, stageLeagueEntries, _))
        } else None
      }
    }
  }
}


case class League(matches: List[FootballMatch], leagueTable: Seq[LeagueTableEntry], round: Round) extends CompetitionStage

case class Groups(matches: List[FootballMatch], groupTables: List[(Round, Seq[LeagueTableEntry])]) extends CompetitionStage {
  def matchesList(competition: Competition, round: Round) = CompetitionRoundMatchesList(Competitions(), competition, round)
}

trait Knockout extends CompetitionStage {
  val rounds: List[Round]
  def matchesList(competition: Competition, round: Round): MatchesList
  lazy val activeRound: Option[Round] = {
    rounds.find(r => roundMatches(r).exists(!_.isResult)).orElse(rounds.lastOption)
  }
  def isActiveRound(round: Round): Boolean = activeRound.exists(_ == round)
}
case class KnockoutList(matches: List[FootballMatch], rounds: List[Round]) extends Knockout {
  override def matchesList(competition: Competition, round: Round) = CompetitionRoundMatchesList(Competitions(), competition, round)
}
case class KnockoutSpider(matches: List[FootballMatch], rounds: List[Round], matchDates: List[DateTime]) extends Knockout {
  override def matchesList(competition: Competition, round: Round) = CompetitionRoundMatchesList(Competitions(), competition, round)

  override def roundMatches(round: Round): List[FootballMatch] =
    super.roundMatches(round).sortWith(lt)

  private val matchIntervals = matchDates.map(dateTime => new Interval(dateTime.minusHours(1), dateTime.plusHours(1)))
  private def lt(match1: FootballMatch, match2: FootballMatch): Boolean = {
    matchIntervals.indexWhere(_.contains(match1.date)) < matchIntervals.indexWhere(_.contains(match2.date))
  }
}
object KnockoutSpider {
  val orderings: Map[String, List[DateTime]] = Map(
    // world cup 2014
    "700" -> List(
      new DateTime(2014, 6, 28, 17, 0), // 3689946
      new DateTime(2014, 6, 28, 21, 0), // 3689963
      new DateTime(2014, 6, 30, 17, 0), // 3689950
      new DateTime(2014, 6, 30, 21, 0), // 3689951
      new DateTime(2014, 6, 29, 17, 0), // 3689948
      new DateTime(2014, 6, 29, 21, 0), // 3689949
      new DateTime(2014, 7, 1, 17, 0),  // 3689952
      new DateTime(2014, 7, 1, 21, 0),  // 3689953

      new DateTime(2014, 7, 4, 21, 0),  // 3689954
      new DateTime(2014, 7, 4, 17, 0),  // 3689955
      new DateTime(2014, 7, 5, 21, 0),  // 3689956
      new DateTime(2014, 7, 5, 17, 0),  // 3689957

      new DateTime(2014, 7, 8, 21, 0),  // 3689958
      new DateTime(2014, 7, 9, 21, 0),  // 3689959

      new DateTime(2014, 7, 12, 21, 0), // 3689960
      new DateTime(2014, 7, 13, 20, 0)  // 3689961
    )
  )
}
