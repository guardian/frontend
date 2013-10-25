package model.commercial.jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import model.commercial.Keyword
import conf.ContentApi
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import scala.util.Try

object JobsAgent extends ExecutionContexts with Logging {

  private lazy val agent = AkkaAgent[Seq[Job]](Nil)

  def jobs(keywords: Seq[String], jobsToChooseFrom: Seq[Job] = currentJobs) = {
    jobsToChooseFrom filter {
      job =>
        val intersect = keywords.map(_.toLowerCase).toSet & job.keywords.map(_.name.toLowerCase)
        intersect.size > 0
    }
  }

  def currentJobs: Seq[Job] = agent()

  def refresh() {
    for {
      untaggedJobs <- JobsApi.getCurrentJobs()
      (unchangedJobs, newUntaggedJobs) = unchangedJobsAndNewUntaggedJobs(untaggedJobs)
      jobs = unchangedJobs ++ tagWithKeywords(newUntaggedJobs)
    } yield agent send jobs
  }

  def unchangedJobsAndNewUntaggedJobs(newJobs: Seq[Job], currJobs: Seq[Job] = currentJobs): (Seq[Job], Seq[Job]) = {
    val currentUntaggedJobs = currJobs map (_.copy(keywords = Set()))
    val (unchangedUntaggedJobs, newUntaggedJobs) = newJobs partition {
      job => currentUntaggedJobs contains job
    }
    val unchangedJobIds = unchangedUntaggedJobs map (_.id)
    val unchangedJobs = currJobs filter {
      job => unchangedJobIds.contains(job.id)
    }
    (unchangedJobs, newUntaggedJobs)
  }

  def tagWithKeywords(untaggedJobs: Seq[Job],
                      lookUp: (String) => Future[Seq[Keyword]] = contentApiResponse): Seq[Job] = {

    def lookUpKeywords(jobApiTag: String): Seq[Keyword] = {
      val query = jobApiTag replace("&", "") replace(",", "")
      val keywords = Try(Await.result(lookUp(query), atMost = 2.seconds)).getOrElse(Nil)

      log.debug(s"Looking up $jobApiTag gave ${keywords.map(_.id).mkString("; ")}")
      keywords
    }

    val jobApiTags: Set[String] = untaggedJobs.flatMap(job => job.sectorTags).toSet

    val jobApiTagsToKeywords: Map[String, Seq[Keyword]] = {
      jobApiTags.foldLeft(Map[String, Seq[Keyword]]()) {
        (acc, tag) => acc + (tag -> lookUpKeywords(tag))
      }
    }

    def keywordsForJobApiTags(jobApiTags: Seq[String]): Set[Keyword] = {
      jobApiTagsToKeywords.filter {
        case (jobApiTag, _) => jobApiTags contains jobApiTag
      }.values.flatten.toSet
    }

    val jobs = for {
      job <- untaggedJobs
      jobKeywords = keywordsForJobApiTags(job.sectorTags)
    } yield job.copy(keywords = jobKeywords)

    log.info(s"Tagged ${jobs.size} jobs")
    log.debug(s"First jobs loaded: ${jobs.take(5).mkString("\n")}")
    log.debug(s"Last jobs loaded: ${jobs.takeRight(5).mkString("\n")}")

    jobs
  }

  def contentApiResponse(query: String): Future[Seq[Keyword]] = {
    ContentApi.tags.stringParam("type", "keyword").stringParam("q", query).pageSize(50).response map {
      _.results map (tag => Keyword(tag.id, tag.webTitle))
    }
  }

}
