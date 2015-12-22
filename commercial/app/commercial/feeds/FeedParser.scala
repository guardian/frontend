package commercial.feeds

import common.ExecutionContexts
import model.commercial.jobs.{Job, JobsAgent}
import model.commercial.soulmates.{Member, SoulmatesAgent}

import scala.concurrent.Future
import scala.concurrent.duration.Duration

sealed trait FeedParser[+T] extends ExecutionContexts {

  def feedName: String

  def parse(getFeed: String => Option[String]): Future[ParsedFeed[T]]
}

object FeedParser {

  private val jobs: FeedParser[Job] = new FeedParser[Job] {
    val feedName = "jobs"

    def parse(getFeed:String => Option[String]): Future[ParsedFeed[Job]] = JobsAgent.refresh(getFeed)
  }

  private val soulmates: Seq[FeedParser[Member]] = {
    for (agent <- SoulmatesAgent.agents) yield {
      new FeedParser[Member] {
        val feedName = s"soulmates/${agent.groupName}"

        def parse(getFeed:String => Option[String]): Future[ParsedFeed[Member]] = agent.refresh(getFeed)
      }
    }
  }

  val all = Seq(jobs) ++ soulmates
}

case class ParsedFeed[+T](contents: Seq[T], parseDuration: Duration)

case class MissingFeedException(feedName: String) extends Exception(s"Missing feed: $feedName")
