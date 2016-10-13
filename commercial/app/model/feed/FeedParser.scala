package commercial.feeds

import common.ExecutionContexts
import conf.Configuration
import model.commercial.{Book, Job, LiveEvent, Masterclass, Member, TravelOffer}
import model.commercial.books.BestsellersAgent
import model.commercial.events.{LiveEventAgent, MasterclassAgent}
import model.commercial.jobs.JobsAgent
import model.commercial.soulmates.SoulmatesAgent
import model.commercial.travel.TravelOffersAgent

import scala.concurrent.Future
import scala.concurrent.duration.Duration

sealed trait FeedParser[+T] extends ExecutionContexts {

  def feedMetaData: FeedMetaData
  def parse(feedContent: => Option[String]): Future[ParsedFeed[T]]
}

class FeedsParser(bestsellersAgent: BestsellersAgent,
                  liveEventAgent: LiveEventAgent,
                  masterclassAgent: MasterclassAgent,
                  travelOffersAgent: TravelOffersAgent,
                  jobsAgent: JobsAgent) {

  private val jobs: Option[FeedParser[Job]] = {
    Configuration.commercial.jobsUrl map { url =>
      new FeedParser[Job] {

        val feedMetaData = JobsFeedMetaData(url)

        def parse(feedContent: => Option[String]) = jobsAgent.refresh(feedMetaData, feedContent)
      }
    }
  }

  private val soulmates: Seq[FeedParser[Member]] = {
    val parsers = Configuration.commercial.soulmatesApiUrl map { url =>
      SoulmatesAgent.agents map { agent =>
        new FeedParser[Member] {

          val feedMetaData = SoulmatesFeedMetaData(url, agent)

          def parse(feedContent: => Option[String]) = agent.refresh(feedMetaData, feedContent)
        }
      }
    }
    parsers getOrElse Nil
  }

  private val bestsellers: Option[FeedParser[Book]] = {
    Configuration.commercial.magento.domain map { domain =>
      new FeedParser[Book] {

        val feedMetaData = BestsellersFeedMetaData(domain)

        def parse(feedContent: => Option[String]) = bestsellersAgent.refresh(feedMetaData, feedContent)
      }
    }
  }

  private val masterclasses: Option[FeedParser[Masterclass]] = {
    Configuration.commercial.masterclassesToken map { accessToken =>
      new FeedParser[Masterclass] {

        val feedMetaData = EventsFeedMetaData("masterclasses", accessToken)

        def parse(feedContent: => Option[String]) = masterclassAgent.refresh(feedMetaData, feedContent)
      }
    }
  }

  private val liveEvents: Option[FeedParser[LiveEvent]] = {
    Configuration.commercial.liveEventsToken map { accessToken =>
      new FeedParser[LiveEvent] {

        val feedMetaData = EventsFeedMetaData("live-events", accessToken)

        def parse(feedContent: => Option[String]) = liveEventAgent.refresh(feedMetaData, feedContent)
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

  val all = soulmates ++ Seq(jobs, bestsellers, masterclasses, liveEvents, travelOffers).flatten
}

case class ParsedFeed[+T](contents: Seq[T], parseDuration: Duration)

case class MissingFeedException(feedName: String) extends Exception(s"Missing feed: $feedName")
