package model.commercial.travel

import org.joda.time.DateTime
import model.commercial.Utils._
import model.commercial.{Ad, Keyword, Segment}

case class Offer(id: Int, title: Option[String], offerUrl: String, imageUrl: String, fromPrice: String,
                 earliestDeparture: DateTime, keywords: List[Keyword], countries: List[String])
  extends Ad {

  def matches(segment: Segment): Boolean = {
    val keywordsMatch = intersects(keywords.map(_.name).toSet, segment.context.keywords.toSet)
    segment.isRepeatVisitor && keywordsMatch
  }

}
