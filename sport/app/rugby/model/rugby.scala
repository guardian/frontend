package rugby.model

import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}

case class Match(
  date: DateTime,
  id: String,
  homeTeam: Team,
  awayTeam: Team,
  venue: Option[String],
  competitionName: String
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
