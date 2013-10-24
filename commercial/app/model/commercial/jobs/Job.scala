package model.commercial.jobs

import org.joda.time.DateTime
import model.commercial.Keyword

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
