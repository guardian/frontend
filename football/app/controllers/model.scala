package controllers

import model.{ Trail, MetaData, Competition }
import org.joda.time.DateMidnight
import feed._

case class MatchesOnDate(date: DateMidnight, competitions: Seq[Competition])

case class CompetitionFilter(name: String, url: String)

case class MatchesPage(
    page: MetaData,
    blog: Option[Trail],
    days: Seq[MatchesOnDate],
    nextPage: Option[String],
    previousPage: Option[String],
    pageType: String,
    filters: Map[String, Seq[CompetitionFilter]] = Map.empty,
    competition: Option[String]) {

  lazy val isLive = days.flatMap(_.competitions.flatMap(_.matches)).exists(_.isLive)
  lazy val urlBase = competition.getOrElse("/football")

}
