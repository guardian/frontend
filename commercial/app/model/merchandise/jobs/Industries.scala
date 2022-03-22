package commercial.model.merchandise.jobs

import common.Box
import commercial.model.capi.Lookup
import contentapi.ContentApiClient

import scala.concurrent.{ExecutionContext, Future}

object Industries {

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
    (350, "Social Enterprise"),
  )
}

class Industries(contentApiClient: ContentApiClient) {

  private val lookup = new Lookup(contentApiClient)
  private lazy val industryKeywordIds = Box(Map.empty[Int, Seq[String]])

  def refresh()(implicit executionContext: ExecutionContext): Future[Iterable[Map[Int, Seq[String]]]] =
    Future.sequence {
      Industries.sectorIdIndustryMap map {
        case (id, name) =>
          lookup.keyword(name) flatMap { keywords =>
            industryKeywordIds.alter(_.updated(id, keywords.map(_.id)))
          }
      }
    }

  def forIndustry(id: Int): Seq[String] = industryKeywordIds().getOrElse(id, Nil)
}
