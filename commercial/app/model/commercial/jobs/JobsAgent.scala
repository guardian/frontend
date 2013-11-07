package model.commercial.jobs

import common.{ExecutionContexts, Logging}
import model.commercial.{AdAgent, Keyword}
import conf.ContentApi
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import scala.util.Try
import play.api.Play
import services.S3
import scala.xml.XML
import play.api.Play.current

object JobsAgent extends AdAgent[Job] with ExecutionContexts with Logging {

  def refresh() {

    val currentJobs =
      if (Play.isDev) {
        val jobAdData = Try(S3.get("DEV/commercial/job-ads.xml")) getOrElse None
        jobAdData.map {
          content =>
            val xml = Future(XML.loadString(content))
            JobsApi.getCurrentJobs(xml)
        }.getOrElse(Future(Nil))
      }
      else JobsApi.getCurrentJobs()

    for {
      untaggedJobs <- currentJobs
      (unchangedJobs, newUntaggedJobs) = unchangedJobsAndNewUntaggedJobs(untaggedJobs)
      jobs = unchangedJobs ++ tagWithKeywords(newUntaggedJobs)
    } yield agent send jobs
  }

  def unchangedJobsAndNewUntaggedJobs(newJobs: Seq[Job], currJobs: Seq[Job] = agent()): (Seq[Job], Seq[Job]) = {
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
