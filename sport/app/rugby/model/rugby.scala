package rugby.model

import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}

case class Match(
  date: DateTime,
  id: String,
  homeTeam: Team,
  awayTeam: Team,
  venue: Option[String],
  competitionName: String,
  status: Status
) {
  def hasTeam(teamId: String) = homeTeam.id == teamId || awayTeam.id == teamId

  lazy val teamTags: List[String] = model.RugbyContent.teamNameIds.collect {
    case (tag, team) if List(homeTeam.id, awayTeam.id).contains(team) => tag
  }.toList

  lazy val key: String = {
    s"${Match.dateFormat.print(date)}/${homeTeam.id}/${awayTeam.id}"
  }

  override def toString(): String = {
    s"${homeTeam.name} v ${awayTeam.name} ${date.toString}"
  }
}

object Match {
  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy/MM/dd")
}

case class Team(
  id: String,
  name: String,
  score: Option[Int] = None
)

trait Status

object Status {
  object Result extends Status                // The match is finished
  object Postponed extends Status             // The match has been postponed before kick off
  object Abandoned extends Status             // The match started but has been abandoned before it was completed
  object Fixture extends Status               // The match has not started
  object TeamIn extends Status                // The teams for the match have been announced and are in the feed
  object FirstHalf extends Status             // The match is in progress in the first half
  object HalfTime extends Status              // The match is at half time
  object SecondHalf extends Status            // The second half is being played
  object FullTime extends Status              // The game has finished the 80 minutes. Please not that this does not mean the match has finished as there may be extra time.
  object ExtraTimeFirstHalf extends Status    // The first half of extra time is being played
  object ExtraTimeHalfTime extends Status     // The first half of extra time has been played and it is at half time
  object ExtraTimeSecondHalf extends Status   // The second half of extra time is being played
  object SuddenDeath extends Status           // Occurs after extra time and essentially means the first point scorer in this period wins
  object ShootOut extends Status              // This is after sudden death and involves players taking drop kicks
}