package model.commercial.jobs

import common.{AkkaAgent, ExecutionContexts}
import model.commercial._
import org.apache.commons.lang.StringUtils
import scala.concurrent.Future
import scala.concurrent.duration._

case class Job(id: Int,
               title: String,
               shortDescription: String,
               locationDescription: Option[String],
               recruiterName: String,
               recruiterPageUrl: Option[String],
               recruiterLogoUrl: String,
               sectorIds: Seq[Int],
               salaryDescription: String,
               keywordIds: Seq[String] = Nil)
  extends Ad {

  val shortSalaryDescription = StringUtils.abbreviate(salaryDescription, 25).replace("...", "…")

  def listingUrl = s"http://jobs.theguardian.com/job/$id"

  def isTargetedAt(segment: Segment): Boolean = {
    val adKeywords = lastPart(keywordIds)
    intersects(segment.context.keywords, adKeywords)
  }

  val industries: Seq[String] =
    Industries.sectorIdIndustryMap.filter { case (sectorId, name) => sectorIds.contains(sectorId)}.values.toSeq

  val mainIndustry: Option[String] = industries.headOption
}

object Industries extends ExecutionContexts {

  private lazy val industryKeywordIds = AkkaAgent(Map.empty[Int, Seq[String]])

  // note, these are ordered by importance
  val sectorIdIndustryMap = Map[Int, String](
    (111, "Charities"),
    (286, "Social care"),
    (127, "Education"),
    (166, "Government & Politics"),
    (196, "Housing"),
    (223, "Marketing & PR"),
    (184, "Health"),
    (235, "Media"),
    (218, "Legal"),
    (101, "Arts & heritage"),
    (149, "Finance & Accounting"),
    (141, "Environment"),
    (211, "Technology"),
    (124, "Construction"),
    (137, "Engineering"),
    (142, "Design"),
    (158, "General"),
    (204, "Hospitality"),
    (219, "Leisure"),
    (244, "Recruitment"),
    (245, "Retail & FMCG"),
    (259, "Science"),
    (294, "Travel & transport"),
    (343, "Skilled Trade"),
    (350, "Social Enterprise")
  )

  def refresh() = Future.sequence {
    sectorIdIndustryMap map {
      case (id, name) =>
        Lookup.keyword(name) flatMap {
          keywords => industryKeywordIds.alter(_.updated(id, keywords.map(_.id)))(5.seconds)
        }
    }
  }

  def stop() {
    industryKeywordIds.close()
  }

  def forIndustry(id: Int) = industryKeywordIds().get(id).getOrElse(Nil)
}
