package controllers

import model.{ MetaData, Competition }
import org.joda.time.DateMidnight

case class MatchesOnDate(date: DateMidnight, competitions: Seq[Competition])
case class MatchesPage(page: MetaData, days: Seq[MatchesOnDate],
  nextPage: Option[String], previousPage: Option[String], pageType: String)
