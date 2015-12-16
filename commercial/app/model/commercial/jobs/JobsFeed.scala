package model.commercial.jobs

import java.lang.System.currentTimeMillis
import java.util.concurrent.TimeUnit.MILLISECONDS

import commercial.feeds.{MissingFeedException, ParsedFeed, SwitchOffException}
import common.{ExecutionContexts, Logging}
import conf.switches.Switches

import scala.concurrent.Future
import scala.concurrent.duration.Duration
import scala.util.control.NonFatal
import scala.xml.{Elem, XML}

object JobsFeed extends ExecutionContexts with Logging {

  def parse(xml: Elem): Seq[Job] = for {
    jobXml <- xml \\ "Job"
    if (jobXml \ "RecruiterLogoURL").nonEmpty
    if (jobXml \ "RecruiterName").text != "THE GUARDIAN MASTERCLASSES"
  } yield Job(jobXml)

  def parsedJobs(feedName: String, getFeed: String => Option[String]): Future[ParsedFeed[Job]] = {
    Switches.JobFeedSwitch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        getFeed(feedName) map { body =>
          val parsed = parse(XML.loadString(body.dropWhile(_ != '<')))
          Future(ParsedFeed(parsed, Duration(currentTimeMillis - start, MILLISECONDS)))
        } getOrElse {
          Future.failed(MissingFeedException(feedName))
        }
      } else {
        Future.failed(SwitchOffException(Switches.JobFeedSwitch.name))
      }
    } recoverWith {
      case NonFatal(e) => Future.failed(e)
    }
  }
}
