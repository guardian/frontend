package football.model

import football.datetime.Interval

import java.time.{ZoneId, ZonedDateTime}
import model.Competition
import pa._
import implicits.Football._

import scala.util.Try

sealed trait CompetitionStageLike {
  val matches: List[FootballMatch]
  def roundMatches(round: Round): List[FootballMatch] = matches.filter(_.round == round)
}

class CompetitionStage(competitions: Seq[Competition]) {

  def stagesFromCompetition(
      competition: Competition,
      orderings: Map[String, List[ZonedDateTime]] = Map.empty,
  ): List[CompetitionStageLike] = {
    val stagesWithMatches = competition.matches.toList.groupBy(_.stage).toList
    val allStagesHaveStarted = stagesWithMatches.forall { case (_, matches) => matches.exists(_.hasStarted) }
    // if all stages have started, reverse order (typically at most two stages so means "show most recent first")
    val sortedStagesWithMatches =
      if (allStagesHaveStarted) stagesWithMatches.reverse
      else stagesWithMatches

    sortedStagesWithMatches.flatMap {
      case (stage, stageMatches) =>
        // work out stage type
        val stageLeagueEntries = competition.leagueTable.filter(_.stageNumber == stage.stageNumber)
        val rounds = stageMatches.map(_.round).distinct.sortBy(_.roundNumber)
        if (stageLeagueEntries.isEmpty) {
          if (rounds.size > 1) {
            orderings.get(competition.id) match {
              case Some(matchDates) if orderingsApplyToTheseMatches(matchDates, stageMatches) =>
                // for knockout tournaments PA delete and re-issue ghost/placeholder matches when the actual teams become available
                // this would create duplicate matches since our addMatches code is purely additive, so we must de-dupe matches based on KO time
                val dedupedMatches = stageMatches.groupBy(_.date).flatMap {
                  case (_, dateMatches) =>
                    dateMatches.sortWith {
                      case (match1, match2) =>
                        Try(match1.id.toInt > match2.id.toInt)
                          .getOrElse(match1.id > match2.id)
                    }.headOption
                }
                Some(KnockoutSpider(competitions, dedupedMatches.toList, rounds, matchDates))
              case _ =>
                // if there are no orderings, or the provided orderings do not apply to the
                // matches in this round then we cannot show a spider, fall back to list
                // NOTE: check the timezone on your orderings (we use UK time for all football stuff)
                Some(KnockoutList(competitions, stageMatches, rounds))
            }
          } else None // or just a collection of matches (e.g. international friendlies)
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

  private def orderingsApplyToTheseMatches(matchDates: List[ZonedDateTime], matches: List[FootballMatch]): Boolean = {
    KnockoutSpider
      .makeMatchIntervals(matchDates)
      .exists(interval => matches.exists(fMatch => interval.contains(fMatch.date)))
  }
}

case class League(matches: List[FootballMatch], leagueTable: Seq[LeagueTableEntry], round: Round)
    extends CompetitionStageLike

case class Groups(
    competitions: Seq[Competition],
    matches: List[FootballMatch],
    groupTables: List[(Round, Seq[LeagueTableEntry])],
) extends CompetitionStageLike {
  def matchesList(competition: Competition, round: Round): CompetitionRoundMatchesList =
    CompetitionRoundMatchesList(competitions, competition, round)
}

sealed trait Knockout extends CompetitionStageLike {
  val rounds: List[Round]
  def matchesList(competition: Competition, round: Round): MatchesList
  lazy val activeRound: Option[Round] = {
    rounds.find(r => roundMatches(r).exists(!_.isResult)).orElse(rounds.lastOption)
  }
  def isActiveRound(round: Round): Boolean = activeRound.contains(round)
}
case class KnockoutList(competitions: Seq[Competition], matches: List[FootballMatch], rounds: List[Round])
    extends Knockout {
  override def matchesList(competition: Competition, round: Round): CompetitionRoundMatchesList =
    CompetitionRoundMatchesList(competitions, competition, round)
}
case class KnockoutSpider(
    competitions: Seq[Competition],
    matches: List[FootballMatch],
    rounds: List[Round],
    matchDates: List[ZonedDateTime],
) extends Knockout {
  override def matchesList(competition: Competition, round: Round): CompetitionRoundMatchesList =
    CompetitionRoundMatchesList(competitions, competition, round)

  override def roundMatches(round: Round): List[FootballMatch] =
    super.roundMatches(round).sortWith(lt)

  private val matchIntervals = KnockoutSpider.makeMatchIntervals(matchDates)
  private def lt(match1: FootballMatch, match2: FootballMatch): Boolean = {
    matchIntervals.indexWhere(_.contains(match1.date)) < matchIntervals.indexWhere(_.contains(match2.date))
  }
}
object KnockoutSpider {
  // Pay attention to the timezone for the orderings
  // If the dates of the matches don't line up with the ordering dates, the ordering will be ignored.

  /*
    How to find the line ordering ?
    To avoid the same drama every two or so years, see this PR: https://github.com/guardian/frontend/pull/23929
   */

  val orderings: Map[String, List[ZonedDateTime]] = Map(
    // world cup 2018
    "700" -> List(
      ZonedDateTime.of(2018, 6, 30, 19, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16 4044557
      ZonedDateTime.of(2018, 6, 30, 15, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16 4044556
      ZonedDateTime.of(2018, 7, 2, 15, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16 4044560
      ZonedDateTime.of(2018, 7, 2, 19, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16 4044561
      ZonedDateTime.of(2018, 7, 1, 15, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16 4044558
      ZonedDateTime.of(2018, 7, 1, 19, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16 4044559
      ZonedDateTime.of(2018, 7, 3, 15, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16 4044562
      ZonedDateTime.of(2018, 7, 3, 19, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16 4044563
      ZonedDateTime.of(2018, 7, 6, 15, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final 4044564
      ZonedDateTime.of(2018, 7, 6, 19, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final 4044565
      ZonedDateTime.of(2018, 7, 7, 19, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final 4044567
      ZonedDateTime.of(2018, 7, 7, 15, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final 4044566
      ZonedDateTime.of(2018, 7, 10, 19, 0, 0, 0, ZoneId.of("Europe/London")), // Semi-Final 4044568
      ZonedDateTime.of(2018, 7, 11, 19, 0, 0, 0, ZoneId.of("Europe/London")), // Semi-Final 4044569
      ZonedDateTime.of(2018, 7, 14, 15, 0, 0, 0, ZoneId.of("Europe/London")), // 3rd/4th Play-Offs 4044570
      ZonedDateTime.of(2018, 7, 15, 16, 0, 0, 0, ZoneId.of("Europe/London")), // Final 4044571
    ),
    // women world cup 2019
    "870" -> List(
      ZonedDateTime.of(2019, 6, 22, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16
      ZonedDateTime.of(2019, 6, 23, 16, 30, 0, 0, ZoneId.of("Europe/London")), // Round of 16
      ZonedDateTime.of(2019, 6, 23, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16
      ZonedDateTime.of(2019, 6, 24, 18, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16
      ZonedDateTime.of(2019, 6, 25, 17, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16
      ZonedDateTime.of(2019, 6, 25, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16
      ZonedDateTime.of(2019, 6, 22, 16, 30, 0, 0, ZoneId.of("Europe/London")), // Round of 16
      ZonedDateTime.of(2019, 6, 24, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16
      ZonedDateTime.of(2019, 6, 27, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final
      ZonedDateTime.of(2019, 6, 28, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final
      ZonedDateTime.of(2019, 6, 29, 14, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final
      ZonedDateTime.of(2019, 6, 29, 17, 30, 0, 0, ZoneId.of("Europe/London")), // Quarter Final
      ZonedDateTime.of(2019, 7, 2, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Semi-Final
      ZonedDateTime.of(2019, 7, 3, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Semi-Final
      ZonedDateTime.of(2019, 7, 6, 16, 0, 0, 0, ZoneId.of("Europe/London")), // 3rd/4th Play-Offs
      ZonedDateTime.of(2019, 7, 7, 16, 0, 0, 0, ZoneId.of("Europe/London")), // Final
    ),
    // Euro 2020
    "750" -> List(
      ZonedDateTime.of(2021, 6, 27, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16   // Match 40
      ZonedDateTime.of(2021, 6, 26, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16   // Match 38
      ZonedDateTime.of(2021, 6, 28, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16   // Match 42
      ZonedDateTime.of(2021, 6, 28, 17, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16   // Match 41
      ZonedDateTime.of(2021, 6, 29, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16   // Match 44
      ZonedDateTime.of(2021, 6, 29, 17, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16   // Match 43
      ZonedDateTime.of(2021, 6, 27, 17, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16   // Match 39
      ZonedDateTime.of(2021, 6, 26, 17, 0, 0, 0, ZoneId.of("Europe/London")), // Round of 16   // Match 37
      ZonedDateTime.of(2021, 7, 2, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final  // Match 46
      ZonedDateTime.of(2021, 7, 2, 17, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final  // Match 45
      ZonedDateTime.of(2021, 7, 3, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final  // Match 48
      ZonedDateTime.of(2021, 7, 3, 17, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter Final  // Match 47
      ZonedDateTime.of(2021, 7, 6, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Semi-Final     // Match 49
      ZonedDateTime.of(2021, 7, 7, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Semi-Final     // Match 50
      ZonedDateTime.of(2021, 7, 11, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Final         // Match 51
    ),
    // Womens Euro 2022
    "423" -> List(
      // Group A Winner & Group B Runner Up
      ZonedDateTime.of(2022, 7, 20, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter-Final 1  // 4287725
      // Group C Winner & Group D Runner up
      ZonedDateTime.of(2022, 7, 22, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter-Final 3  // 4287727
      // Group B Winner & Group A Runner Up
      ZonedDateTime.of(2022, 7, 21, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter-Final 2  // 4287726
      // Group D Winner & Group C Runner up
      ZonedDateTime.of(2022, 7, 23, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Quarter-Final 4  // 4287728
      // QF Winners 3 & 1
      ZonedDateTime.of(2022, 7, 26, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Semi-Final 1     // 4287730
      // QF Winners 4 & 2
      ZonedDateTime.of(2022, 7, 27, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Semi-Final 2     // 4287731
      // SM Winners 1 & 2
      ZonedDateTime.of(2022, 7, 31, 20, 0, 0, 0, ZoneId.of("Europe/London")), // Final            // 4287732
    ),
  )

  // adds a little flex around the match dates in case they aren't listed at exactly the right time
  // (especially for ghost/placeholder matches in tournaments)
  def makeMatchIntervals(matchDates: List[ZonedDateTime]): List[Interval] = {
    matchDates.map(dateTime => {
      Interval(dateTime.minusHours(1), dateTime.plusHours(1))
    })
  }
}
