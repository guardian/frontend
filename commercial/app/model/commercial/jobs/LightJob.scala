package model.commercial.jobs

import model.commercial.Utils._
import model.commercial.{Ad,Segment}

case class LightJob(id: Int,
               title: String,
               shortDescription: String,
               recruiterName: String,
               recruiterLogoUrl: Option[String],
               sectorIds: Set[Int])
  extends Ad {

  def listingUrl = s"http://guardianv3-web.madgexjbtest.com/job/$id"

  def isTargetedAt(segment: Segment): Boolean = {
    val sectionMatches = segment.context.section exists {
      section => intersects(sectorIds.toSet, LightJob.matchingSectorIds(section))
    }
    sectionMatches
  }

}

object LightJob {

  private val sectorIdSectionsMap = Map[Int, Set[String]](
    111 -> Set("business", "community"),
    112 -> Set("business", "law", "money")
  )

  private val sectionSectorIdsMap = {
    val sectionSectorIdPairs = sectorIdSectionsMap.map(_.swap).map {
      case (sections, sectorId) => sections map ((_, sectorId))
    }.flatten.toSet

    sectionSectorIdPairs.groupBy {
      case (section, sectorId) => section
    }.mapValues {
      _.map {
        case (section, sectorId) => sectorId
      }
    }
  }

  def matchingSectorIds(section: String): Set[Int] = {
    sectionSectorIdsMap getOrElse(section, Set())
  }

}
