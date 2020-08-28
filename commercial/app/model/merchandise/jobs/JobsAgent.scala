package commercial.model.merchandise.jobs

import commercial.model.Segment
import commercial.model.capi.Keyword
import commercial.model.feeds.{FeedMetaData, ParsedFeed}
import commercial.model.merchandise.{Job, MerchandiseAgent}

import scala.concurrent.{ExecutionContext, Future}

class JobsAgent(allIndustries: Industries) extends MerchandiseAgent[Job] {

  def jobsTargetedAt(segment: Segment): Seq[Job] = {
    def defaultJobs = available filter (_.industries.contains("Media"))
    getTargetedMerchandise(segment, defaultJobs) { job =>
      Keyword.idSuffixesIntersect(segment.context.keywords, job.keywordIdSuffixes)
    }
  }

  def specificJobs(jobIdStrings: Seq[String]): Seq[Job] = {
    val jobIds = jobIdStrings map (_.toInt)
    available filter (job => jobIds contains job.id)
  }

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String])(implicit
      executionContext: ExecutionContext,
  ): Future[ParsedFeed[Job]] = {

    def withKeywords(parsedFeed: Future[ParsedFeed[Job]]): Future[ParsedFeed[Job]] = {
      parsedFeed map { feed =>
        val jobs = feed.contents map { job =>
          val jobKeywordIds = job.sectorIds.flatMap(allIndustries.forIndustry).distinct
          job.copy(keywordIdSuffixes = jobKeywordIds map Keyword.getIdSuffix)
        }
        ParsedFeed(jobs, feed.parseDuration)
      }
    }

    val parsedFeed = withKeywords(JobsFeed.parsedJobs(feedMetaData, feedContent))

    parsedFeed foreach { feed =>
      updateAvailableMerchandise(feed.contents)
    }

    parsedFeed
  }
}
