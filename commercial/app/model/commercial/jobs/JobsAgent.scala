package model.commercial.jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import model.commercial.Keyword
import conf.ContentApi
import scala.concurrent.Future

object JobsAgent extends ExecutionContexts with Logging {

  private lazy val agent = AkkaAgent[Seq[Job]](Nil)

  def jobs(keywords: Seq[String], jobsToChooseFrom: Seq[Job] = allJobs) = {
    jobsToChooseFrom filter {
      job =>
        val intersect = keywords.map(_.toLowerCase).toSet & job.keywords.map(_.name.toLowerCase)
        intersect.size > 0
    }
  }

  def allJobs: Seq[Job] = agent()

  def refresh() {

    def tagWithKeywords(jobs: Seq[Job]): Future[Seq[Job]] = {

      def lookUpKeywords(jobApiTag: String): Future[Seq[Keyword]] = {
        val query = jobApiTag replace("&", "") replace(",", "")
        val futureKeywords = ContentApi.tags.stringParam("type", "keyword").stringParam("q", query).pageSize(50).response map {
          _.results map (tag => Keyword(tag.id, tag.webTitle))
        }

        for (keywords <- futureKeywords)
          log.debug(s"Looking up $jobApiTag gave ${keywords.map(_.id).mkString("; ")}")

        futureKeywords
      }

      def jobApiTags: Set[String] = jobs.flatMap(job => job.sectorTags).toSet

      def jobsHavingJobApiTag(tag: String) = jobs filter (_.sectorTags.contains(tag))

      def jobApiTagsToKeywords: Map[String, Future[Seq[Keyword]]] = {
        jobApiTags.foldLeft(Map[String, Future[Seq[Keyword]]]()) {
          (acc, tag) => acc + (tag -> lookUpKeywords(tag))
        }
      }

      val futureJobs = Future.sequence {
        jobApiTagsToKeywords.map {
          case (jobApiTag, futureKeywords) => futureKeywords.map {
            keywords => jobsHavingJobApiTag(jobApiTag).map {
              job => job.copy(keywords = job.keywords ++ keywords)
            }.toSeq
          }
        }
      }.map(_.flatten.toSeq)

      for (jobs <- futureJobs) {
        log.info(s"Tagged ${jobs.size} jobs")
        log.debug(s"First jobs loaded: ${jobs.take(5).mkString("\n")}")
        log.debug(s"Last jobs loaded: ${jobs.takeRight(5).mkString("\n")}")
      }

      futureJobs
    }

    // TODO only tag new jobs
    for {
      untaggedJobs <- JobsApi.getAllJobs()
      jobs <- tagWithKeywords(untaggedJobs)
    } yield agent send jobs
  }

}
