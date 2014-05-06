package football.model

import model.Competition
import pa._
import pa.LiveMatch
import model.Competition


trait CompetitionStage {
  val matches: List[FootballMatch]
  def roundMatches(round: Round): List[FootballMatch] = matches.filter(_.round == round)
  lazy val hasStarted = matches.exists {
    case _: LiveMatch => true
    case _: Result => true
    case _ => false
  }
}
object CompetitionStage {

  private def matchesHaveStarted(matches: List[FootballMatch]): Boolean = matches.exists {
    case _: LiveMatch => true
    case _: Result => true
    case _ => false
  }

  def stagesFromCompetition(competition: Competition): List[CompetitionStage] = {
    val stagesWithMatches = competition.matches.groupBy(_.stage).toList
    val allStagesHaveStarted = stagesWithMatches.forall { case (_, matches) => matchesHaveStarted(matches) }

    // if all stages have started, reverse order (typically at most two stages so means "show most recent first")
    val sortedStagesWithMatches =
      if (allStagesHaveStarted) stagesWithMatches.reverse
      else stagesWithMatches

    sortedStagesWithMatches.flatMap { case (stage, stageMatches) =>
      // work out stage type
      val stageLeagueEntries = competition.leagueTable.filter(_.stageNumber == stage.stageNumber)
      val rounds = stageMatches.map(_.round).distinct.sortBy(_.roundNumber)

      if (stageLeagueEntries.isEmpty) {
        // if multiple rounds, it's a tournament, otherwise just a collection of matches (no stages)
        if (rounds.size > 1) Some(Knockout(stageMatches, rounds))
        else None
      } else {
        // if multiple rounds, must be groups, else a simple league
        if (rounds.size > 1) Some(Groups(stageMatches, competition.leagueTable.filter(_.stageNumber == stage.stageNumber).groupBy(_.round)))
        else if (rounds.size == 1) rounds.headOption.map(League(stageMatches, competition.leagueTable.filter(_.stageNumber == stage.stageNumber), _))
        else None
      }
    }
  }
}


case class League(matches: List[FootballMatch], leagueTable: Seq[LeagueTableEntry], round: Round) extends CompetitionStage

case class Knockout(matches: List[FootballMatch], rounds: List[Round]) extends CompetitionStage {
  def matchesForRound(round: Round) = matches.filter(_.round == round)
}

case class Groups(matches: List[FootballMatch], groupTables: Map[Round, Seq[LeagueTableEntry]]) extends CompetitionStage
