package controllers

import model.{ Trail, MetaData, Competition }
import org.joda.time.DateMidnight

case class MatchesOnDate(date: DateMidnight, competitions: Seq[Competition])

case class MatchesPage(
  page: MetaData,
  blog: Option[Trail],
  days: Seq[MatchesOnDate],
  nextPage: Option[String], previousPage: Option[String], pageType: String)
