package model.commercial.jobs

import commercial.feeds.ParsedFeed
import common.ExecutionContexts
import model.commercial._

import scala.concurrent.Future

object JobsAgent extends MerchandiseAgent[Job] with ExecutionContexts {

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

  def refresh(): Future[ParsedFeed[Job]] = {

    val feedName = "jobs"

    def withKeywords(parsedFeed: Future[ParsedFeed[Job]]): Future[ParsedFeed[Job]] = {
      parsedFeed map { feed =>
        val jobs = feed.contents map { job =>
          val jobKeywordIds = job.sectorIds.flatMap(Industries.forIndustry).distinct
          job.copy(keywordIdSuffixes = jobKeywordIds map Keyword.getIdSuffix)
        }
        ParsedFeed(jobs, feed.parseDuration)
      }
    }

    val parsedFeed = withKeywords(JobsFeed.parsedJobs(feedName))

    parsedFeed foreach { feed =>
      updateAvailableMerchandise(feed.contents)
    }

    parsedFeed
  }
}
