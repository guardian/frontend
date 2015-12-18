package commercial.feeds

import common.ExecutionContexts
import conf.Configuration
import model.commercial.books.{BestsellersAgent, Book}
import model.commercial.jobs.{Job, JobsAgent}
import model.commercial.masterclasses.{MasterClass, MasterClassAgent}
import model.commercial.soulmates.{Member, SoulmatesAgent}

import scala.concurrent.Future
import scala.concurrent.duration.Duration

sealed trait FeedParser[+T] extends ExecutionContexts {

  def feedMetaData: FeedMetaData
  def parse(feedContent: => Option[String]): Future[ParsedFeed[T]]
}

object FeedParser {

  private val jobs: Option[FeedParser[Job]] = {
    Configuration.commercial.jobsUrlTemplate map { template =>
      new FeedParser[Job] {

        val feedMetaData = JobsFeedMetaData(template)

        def parse(feedContent: => Option[String]) = JobsAgent.refresh(feedMetaData, feedContent)
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

        def parse(feedContent: => Option[String]) = BestsellersAgent.refresh(feedMetaData, feedContent)
      }
    }
  }

  private val masterclasses: Option[FeedParser[MasterClass]] = {
    Configuration.commercial.masterclassesToken map { accessToken =>
      new FeedParser[MasterClass] {

        val feedMetaData = MasterclassesFeedMetaData(accessToken, Map.empty)

        def parse(feedContent: => Option[String]) = MasterClassAgent.refresh(feedMetaData, feedContent)
      }
    }
  }

  val all = soulmates ++ Seq(jobs, bestsellers, masterclasses).flatten
}

case class ParsedFeed[+T](contents: Seq[T], parseDuration: Duration)

case class MissingFeedException(feedName: String) extends Exception(s"Missing feed: $feedName")
