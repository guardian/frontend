package model.commercial.jobs

import model.commercial.{Keyword, Ad, Segment}
import model.commercial.Utils._
import conf.ContentApi
import scala.concurrent.Await
import scala.concurrent.duration._
import common.{Logging, ExecutionContexts}
import scala.util.{Success, Failure, Try}
import scala.collection.mutable

case class Job(id: Int,
               title: String,
               shortDescription: String,
               recruiterName: String,
               recruiterLogoUrl: Option[String],
               sectorIds: Seq[Int],
               keywords: Seq[Keyword] = Nil)
  extends Ad {

  def listingUrl = s"http://jobs.theguardian.com/job/$id"

  def isTargetedAt(segment: Segment): Boolean = {
    val someKeywordsMatch = intersects(segment.context.keywords, keywords.map(_.name))
    segment.context.isInSection("business") && someKeywordsMatch
  }
}

object Job extends ExecutionContexts with Logging {

  private val sectorIdIndustryMap = Map[Int, String](
    (101, "Arts & heritage"),
    (111, "Charities"),
    (124, "Construction"),
    (127, "Education"),
    (137, "Engineering"),
    (141, "Environment"),
    (142, "Design"),
    (149, "Finance & Accounting"),
    (158, "General"),
    (166, "Government & Politics"),
    (184, "Health"),
    (196, "Housing"),
    (204, "Hospitality"),
    (211, "Technology"),
    (218, "Legal"),
    (219, "Leisure"),
    (223, "Marketing & PR"),
    (235, "Media"),
    (244, "Recruitment"),
    (245, "Retail & FMCG"),
    (259, "Science"),
    (286, "Social care"),
    (294, "Travel & transport"),
    (343, "Skilled Trade"),
    (350, "Social Enterprise")
  )

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

  private def sectorIdKeywords(sectorIds: Seq[Int]): Map[Int, Seq[Keyword]] = {
    val industryKeywords = mutable.Map[String, Seq[Keyword]]()
    sectorIds.foldLeft(Map[Int, Seq[Keyword]]()) {
      (acc, sectorId) => {
        val keywords = sectorIdIndustryMap.get(sectorId).map {
          industry =>
            industryKeywords.getOrElseUpdate(industry, lookUpCorrespondingKeywords(industry))
        }.getOrElse(Nil)
        acc + (sectorId -> keywords)
      }
    }
  }

  def populateKeywords(jobs: Seq[Job]): Seq[Job] = {
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
