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

    // TODO only tag new jobs and don't include expired jobs in all jobs
    for {
      untaggedJobs <- JobsApi.getAllJobs()
      jobs <- tagWithKeywords(untaggedJobs)
    } yield agent send jobs
  }

  def tagWithKeywords(untaggedJobs: Seq[Job],
                      lookUp: (String) => Future[Seq[Keyword]] = contentApiResponse): Future[Seq[Job]] = {

    def lookUpKeywords(jobApiTag: String): Future[Seq[Keyword]] = {
      val query = jobApiTag replace("&", "") replace(",", "")
      val futureKeywords = lookUp(query)

      for (keywords <- futureKeywords)
        log.debug(s"Looking up $jobApiTag gave ${keywords.map(_.id).mkString("; ")}")

      futureKeywords
    }

    val jobApiTags: Set[String] = untaggedJobs.flatMap(job => job.sectorTags).toSet

    val jobApiTagsToKeywords: Map[String, Future[Seq[Keyword]]] = {
      jobApiTags.foldLeft(Map[String, Future[Seq[Keyword]]]()) {
        (acc, tag) => acc + (tag -> lookUpKeywords(tag))
      }
    }

    def keywordsForJobApiTags(jobApiTags: Seq[String]): Future[Set[Keyword]] = {
      val keywords = jobApiTagsToKeywords.filter {
        case (jobApiTag, _) => jobApiTags contains jobApiTag
      }.values
      Future.sequence(keywords).map(_.flatten.toSet)
    }

    val futureJobs = Future.sequence {
      untaggedJobs.map {
        job => keywordsForJobApiTags(job.sectorTags) map {
          jobKeywords => job.copy(keywords = jobKeywords)
        }
      }
    }

    for (jobs <- futureJobs) {
      log.info(s"Tagged ${jobs.size} jobs")
      log.debug(s"First jobs loaded: ${jobs.take(5).mkString("\n")}")
      log.debug(s"Last jobs loaded: ${jobs.takeRight(5).mkString("\n")}")
    }

    futureJobs
  }

  def contentApiResponse(query: String): Future[Seq[Keyword]] = {
    ContentApi.tags.stringParam("type", "keyword").stringParam("q", query).pageSize(50).response map {
      _.results map (tag => Keyword(tag.id, tag.webTitle))
    }
  }

}
