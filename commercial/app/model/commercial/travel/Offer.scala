package model.commercial.travel

import org.joda.time.DateTime
import model.commercial.Utils._
import model.commercial.{Ad, Keyword, Segment}

case class Offer(id: Int, title: Option[String], offerUrl: String, imageUrl: String, fromPrice: String,
                 earliestDeparture: DateTime, keywords: List[Keyword], countries: List[String], duration: String)
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = {
    val someKeywordsMatch = intersects(keywords.map(_.name), segment.context.keywords)
    segment.context.isInSection("travel") && someKeywordsMatch
  }

  def durationInWords: String = duration match {
    case "1" => return "1 night"
    case x => return s"$x nights"
  }

}
