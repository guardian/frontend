package commercial.model.feeds

import commercial.model.merchandise.jobs.JobsAgent
import commercial.model.merchandise.travel.TravelOffersAgent
import conf.Configuration
import commercial.model.merchandise.{Job, TravelOffer}

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.Duration

sealed trait FeedParser[+T] {

  def feedMetaData: FeedMetaData
  def parse(feedContent: => Option[String]): Future[ParsedFeed[T]]
}

class FeedsParser(
    travelOffersAgent: TravelOffersAgent,
    jobsAgent: JobsAgent,
)(implicit executionContext: ExecutionContext) {

  private val jobs: Option[FeedParser[Job]] = {
    Configuration.commercial.jobsUrl map { url =>
      new FeedParser[Job] {

        val feedMetaData = JobsFeedMetaData(url)

        def parse(feedContent: => Option[String]) = jobsAgent.refresh(feedMetaData, feedContent)
      }
    }
  }

  private val travelOffers: Option[FeedParser[TravelOffer]] = {
    Configuration.commercial.travelFeedUrl map { url =>
      new FeedParser[TravelOffer] {

        val feedMetaData = TravelOffersFeedMetaData(url)

        def parse(feedContent: => Option[String]) = travelOffersAgent.refresh(feedMetaData, feedContent)
      }
    }
  }

  val all = Seq(jobs, travelOffers).flatten
}

case class ParsedFeed[+T](contents: Seq[T], parseDuration: Duration)

case class MissingFeedException(feedName: String) extends Exception(s"Missing feed: $feedName")
