package football.model

import org.joda.time.{Interval, DateTime}
import model.Competition
import pa._
import implicits.Football._
import scala.util.Try

trait CompetitionStageLike {
  val matches: List[FootballMatch]
  def roundMatches(round: Round): List[FootballMatch] = matches.filter(_.round == round)
}

class CompetitionStage(competitions: Seq[Competition]) {

  def stagesFromCompetition(competition: Competition, orderings: Map[String, List[DateTime]] = Map.empty): List[CompetitionStageLike] = {
    val stagesWithMatches = competition.matches.toList.groupBy(_.stage).toList
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
          orderings.get(competition.id).map { matchDates =>
            // for knockout tournaments PA delete and re-issue ghost/placeholder matches when the actual teams become available
            // this would create duplicate matches since our addMatches code is purely additive, so we must de-dupe matches based on KO time
            val dedupedMatches = stageMatches.groupBy(_.date).flatMap { case (_, dateMatches) =>
              dateMatches.sortWith { case (match1, match2) =>
                Try(match1.id.toInt > match2.id.toInt)
                  .getOrElse(match1.id > match2.id)
              }.headOption
            }
            KnockoutSpider(competitions, dedupedMatches.toList, rounds, matchDates)
          }.orElse(Some(KnockoutList(competitions, stageMatches, rounds)))
        } else None  // or just a collection of matches (e.g. international friendlies)
      } else {
        if (rounds.size > 1) {
          // multiple rounds and league table entries is a group stage
          val groupTables = stageLeagueEntries.groupBy(_.round).toList.sortBy(_._1.roundNumber)
          Some(Groups(competitions, stageMatches, groupTables))
        } else if (rounds.size == 1) {
          // single round with table is league
          rounds.headOption.map(League(stageMatches, stageLeagueEntries, _))
        } else None
      }
    }
  }
}


case class League(matches: List[FootballMatch], leagueTable: Seq[LeagueTableEntry], round: Round) extends CompetitionStageLike

case class Groups(competitions: Seq[Competition], matches: List[FootballMatch], groupTables: List[(Round, Seq[LeagueTableEntry])]) extends CompetitionStageLike {
  def matchesList(competition: Competition, round: Round) = CompetitionRoundMatchesList(competitions, competition, round)
}

trait Knockout extends CompetitionStageLike {
  val rounds: List[Round]
  def matchesList(competition: Competition, round: Round): MatchesList
  lazy val activeRound: Option[Round] = {
    rounds.find(r => roundMatches(r).exists(!_.isResult)).orElse(rounds.lastOption)
  }
  def isActiveRound(round: Round): Boolean = activeRound.contains(round)
}
case class KnockoutList(competitions: Seq[Competition], matches: List[FootballMatch], rounds: List[Round]) extends Knockout {
  override def matchesList(competition: Competition, round: Round) = CompetitionRoundMatchesList(competitions, competition, round)
}
case class KnockoutSpider(competitions: Seq[Competition], matches: List[FootballMatch], rounds: List[Round], matchDates: List[DateTime]) extends Knockout {
  override def matchesList(competition: Competition, round: Round) = CompetitionRoundMatchesList(competitions, competition, round)

  override def roundMatches(round: Round): List[FootballMatch] =
    super.roundMatches(round).sortWith(lt)

  private val matchIntervals = matchDates.map(dateTime => new Interval(dateTime.minusHours(1), dateTime.plusHours(1)))
  private def lt(match1: FootballMatch, match2: FootballMatch): Boolean = {
    matchIntervals.indexWhere(_.contains(match1.date)) < matchIntervals.indexWhere(_.contains(match2.date))
  }
}
