package jobs

import common.{Logging, ExecutionContexts, AkkaAgent}
import org.joda.time.DateTime
import scala.slick.session.Database
import scala.slick.lifted.MappedTypeMapper.base
import scala.slick.lifted.TypeMapper
import scala.slick.jdbc.{GetResult, StaticQuery => Q}
import scala.language.postfixOps
import anorm._
import play.api.db

import java.sql.{Date, Timestamp}
import play.api.db.DB
import play.api.Play.current
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}


/**
 * Created by nbennett on 04/09/14.
 */


object SentryReportJob extends ExecutionContexts with Logging {

  implicit val DateTimeMapper: TypeMapper[DateTime] =
    base[DateTime, Timestamp](
      d => new Timestamp(d.getMillis),
      t => new DateTime( t getTime )
    )


  val dateFormatGeneration: DateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd")

  implicit def rowToDateTime: Column[DateTime] = Column.nonNull { (value, meta) =>
    val MetaDataItem(qualified, nullable, clazz) = meta
    value match {
      case ts: java.sql.Timestamp => Right(new DateTime(ts.getTime))
      case d: java.sql.Date => Right(new DateTime(d.getTime))
      case str: java.lang.String => Right(dateFormatGeneration.parseDateTime(str))
      case _ => Left(TypeDoesNotMatch("Cannot convert " + value + ":" + value.asInstanceOf[AnyRef].getClass) )
    }
  }

  case class SentryErrorCount(date: DateTime, count: Long)

  private val sentryReportAgent = AkkaAgent[Map[String, List[(DateTime, Long)]]](Map.empty)

  def run () {

     log.info("connecting to database ..   ")
     val db = DB.withConnection { implicit conn =>
         log.info("Connected to DB")
         val sentryData = SQL(
           """
             select datetime::DATE, count(datetime::DATE) from sentry_message where group_id in (
             	  select id from sentry_groupedmessage where id in (
              		select group_id from sentry_messagefiltervalue where value = 'Gallery' order by group_id
              	)
             ) and datetime > NOW() - INTERVAL '7 days' group by datetime::DATE order by datetime
             """
         )
         val sentryErrorCounts = sentryData().map {
            e => (e[DateTime]("datetime"), e[Long]("count"))
         }.toList



         log.info(" ++ Got data " + sentryErrorCounts)
         sentryReportAgent.send{
         old =>
            old + ( "Gallery" -> sentryErrorCounts )
         }

     }


  }

}
