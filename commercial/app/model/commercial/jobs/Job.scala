package model.commercial.jobs

import org.joda.time.DateTime
import model.commercial.{Ad, Segment, Keyword}
import model.commercial.Utils._

case class Job(id: Int,
               adType: String,
               adStartDate: DateTime,
               adExpiryDate: DateTime,
               isPremium: Boolean,
               positionType: String,
               title: String,
               shortDescription: String,
               salary: String,
               location: Option[String],
               recruiterLogoUrl: Option[String],
               employerLogoUrl: Option[String],
               listingUrl: String,
               applyUrl: String,
               sectorTags: Seq[String],
               locationTags: Seq[String],
               keywords: Set[Keyword] = Set())
  extends Ad {

  def isCurrent = adExpiryDate.isAfterNow

  def matches(segment: Segment): Boolean = {
    val sectionMatches = segment.context.section exists {
      section => intersects(sectorTags.toSet, Job.matchingSectorTags(section))
    }
    val keywordsMatch = intersects(keywords.map(_.name), segment.context.keywords.toSet)
    sectionMatches || keywordsMatch
  }

}

object Job {

  private val sectionSectorTagsMap = Map[String, Set[String]]()

  def matchingSectorTags(section: String): Set[String] = {
    sectionSectorTagsMap getOrElse(section, Set())
  }

}
