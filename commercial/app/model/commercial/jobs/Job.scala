package model.commercial.jobs

import model.commercial._
import common.{AkkaAgent, ExecutionContexts}
import scala.concurrent.duration._
import scala.concurrent.Future
import model.commercial.Segment
import model.commercial.Keyword

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

  val industries: Seq[String] = Industries.sectorIdIndustryMap.filter{ case(id, name) => sectorIds.contains(id) }.values.toSeq

  val mainIndustry: Option[String] = industries.headOption
}

object Industries extends ExecutionContexts {

  private lazy val industryKeywords = AkkaAgent(Map.empty[Int, Seq[Keyword]])

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
          keywords => industryKeywords.alter(_.updated(id, keywords))(5.seconds)
        }
    }
  }

  def stop() {
    industryKeywords.close()
  }

  def forIndustry(id: Int) = industryKeywords().get(id).getOrElse(Nil)
}
