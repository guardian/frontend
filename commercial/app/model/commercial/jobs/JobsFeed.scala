package model.commercial.jobs

import java.lang.System.currentTimeMillis
import java.util.concurrent.TimeUnit.MILLISECONDS

import commercial.feeds.{FeedMetaData, MissingFeedException, ParsedFeed, SwitchOffException}
import common.{ExecutionContexts, Logging}

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

  def parsedJobs(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[Job]] = {
    feedMetaData.switch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        feedContent map { body =>
          val parsed = parse(XML.loadString(body.dropWhile(_ != '<')))
          Future(ParsedFeed(parsed, Duration(currentTimeMillis - start, MILLISECONDS)))
        } getOrElse {
          Future.failed(MissingFeedException(feedMetaData.name))
        }
      } else {
        Future.failed(SwitchOffException(feedMetaData.switch.name))
      }
    } recoverWith {
      case NonFatal(e) => Future.failed(e)
    }
  }
}
