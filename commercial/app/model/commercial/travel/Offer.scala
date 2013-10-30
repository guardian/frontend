package model.commercial.travel

import org.joda.time.DateTime
import model.commercial.Keyword

case class Offer(id: Int, title: Option[String], offerUrl: String, imageUrl: String, fromPrice: String,
                 earliestDeparture: DateTime, keywords: List[Keyword], countries: List[String])
