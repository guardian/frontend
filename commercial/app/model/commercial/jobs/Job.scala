package model.commercial.jobs

import model.commercial.{Ad, Segment}

case class Job(id: Int,
               title: String,
               shortDescription: String,
               recruiterName: String,
               recruiterLogoUrl: Option[String],
               sectorIds: Set[Int])
  extends Ad {

  def listingUrl = s"http://jobs.theguardian.com/job/$id"

  def isTargetedAt(segment: Segment): Boolean = {
    true
    // TODO target sections
    //val sectionMatches = segment.context.section exists {
    //  section => intersects(sectorIds.toSet, Job.matchingSectorIds(section))
    //}
    //sectionMatches
  }

}

object Job {

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
