package commercial.model.merchandise.jobs

import java.lang.System.currentTimeMillis
import java.util.concurrent.TimeUnit.MILLISECONDS

import commercial.model.feeds.{FeedMetaData, MissingFeedException, ParsedFeed, SwitchOffException}
import common.Logging
import conf.switches.Switches.JobsFeedParseSwitch
import commercial.model.merchandise.Job

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.Duration
import scala.util.control.NonFatal
import scala.xml.{Elem, XML}

object JobsFeed extends Logging {

  def parse(xml: Elem): Seq[Job] =
    for {
      jobXml <- xml \\ "Job"
      if (jobXml \ "RecruiterLogoURL").nonEmpty
      if (jobXml \ "RecruiterName").text != "THE GUARDIAN MASTERCLASSES"
    } yield Job.fromXml(jobXml)

  def parsedJobs(feedMetaData: FeedMetaData, feedContent: => Option[String])(implicit
      executionContext: ExecutionContext,
  ): Future[ParsedFeed[Job]] = {
    JobsFeedParseSwitch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        feedContent map { body =>
          val parsed = parse(XML.loadString(body.dropWhile(_ != '<')))
          Future(ParsedFeed(parsed, Duration(currentTimeMillis - start, MILLISECONDS)))
        } getOrElse {
          Future.failed(MissingFeedException(feedMetaData.name))
        }
      } else {
        Future.failed(SwitchOffException(JobsFeedParseSwitch.name))
      }
    } recoverWith {
      case NonFatal(e) => Future.failed(e)
    }
  }
}
