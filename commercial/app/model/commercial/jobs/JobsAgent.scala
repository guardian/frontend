package model.commercial.jobs

import common.{Logging, ExecutionContexts}
import model.commercial.{Keyword, AdAgent}
import scala.util.{Failure, Success, Try}
import scala.concurrent.Await
import conf.ContentApi
import scala.collection.mutable
import scala.concurrent.duration._

object JobsAgent extends AdAgent[Job] with ExecutionContexts with Logging {

  def refresh() {
    for {jobs <- JobsApi.getJobs} {
      updateCurrentAds(populateKeywords(jobs))
    }
  }

  private def lookUpCorrespondingKeywords(term: String): Seq[Keyword] = {
    val q = term replace("&", "") replace(",", "")
    Try(Await.result(
      ContentApi.tags.stringParam("type", "keyword").stringParam("q", q).pageSize(50).response map {
        _.results map (tag => Keyword(tag.id, tag.webTitle))
      }, 2.seconds)) match {
      case Success(result) => result
      case Failure(e) =>
        log.warn(s"Looking up $term failed: $e")
        Nil
    }
  }

  private def populateKeywords(jobs: Seq[Job]): Seq[Job] = {

    def sectorIdKeywords(sectorIds: Seq[Int]): Map[Int, Seq[Keyword]] = {
      val industryKeywords = mutable.Map[String, Seq[Keyword]]()
      sectorIds.foldLeft(Map[Int, Seq[Keyword]]()) {
        (acc, sectorId) => {
          val keywords = Job.sectorIdIndustryMap.get(sectorId).map {
            industry =>
              industryKeywords.getOrElseUpdate(industry, lookUpCorrespondingKeywords(industry))
          }.getOrElse(Nil)
          acc + (sectorId -> keywords)
        }
      }
    }

    val allSectorIds = jobs.flatMap(_.sectorIds)
    val keywords = sectorIdKeywords(allSectorIds)
    jobs.map {
      job =>
        val jobKeywords = job.sectorIds.foldLeft(Seq[Keyword]()) {
          (acc, sectorId) => (acc ++ keywords.get(sectorId).getOrElse(Nil)).distinct
        }
        job.copy(keywords = jobKeywords)
    }
  }
}
