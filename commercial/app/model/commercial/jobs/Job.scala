package model.commercial.jobs

import model.commercial.{Keyword, Ad, Segment}
import model.commercial.Utils._
import common.{AkkaAgent, ExecutionContexts}
import scala.concurrent.duration._
import scala.concurrent.Future

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

object Industries extends ExecutionContexts {

  private lazy val industryKeywords = AkkaAgent(Map.empty[Int, Seq[Keyword]])

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

  def refresh() = Future.sequence {
    sectorIdIndustryMap map {
      case (id, name) =>
        Keyword.lookup(name) flatMap {
          keywords => industryKeywords.alter(_.updated(id, keywords))(5.seconds)
        }
    }
  }

  def stop() {
    industryKeywords.close()
  }

  def forIndustry(id: Int) = industryKeywords().get(id).getOrElse(Nil)
}
