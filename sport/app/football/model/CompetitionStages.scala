package football.model

import model.Competition
import pa._
import pa.LiveMatch
import model.Competition


trait CompetitionStage {
  val matches: List[FootballMatch]
  def roundMatches(round: Round): List[FootballMatch] = matches.filter(_.round == round)
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
        if (rounds.size > 1) Some(Knockout(stageMatches, rounds))  // multiple rounds without league table entries is tournament
        else None  // or just a collection of matches (e.g. international friendlies)
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

case class Knockout(matches: List[FootballMatch], rounds: List[Round]) extends CompetitionStage {
  def matchesForRound(round: Round) = matches.filter(_.round == round)
}

case class Groups(matches: List[FootballMatch], groupTables: List[(Round, Seq[LeagueTableEntry])]) extends CompetitionStage
