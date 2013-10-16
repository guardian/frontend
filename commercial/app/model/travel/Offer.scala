package model.travel

import org.joda.time.DateTime

case class Offer(id: Int, title: Option[String], offerUrl: String, imageUrl: String, fromPrice: String,
                 earliestDeparture: DateTime, keywords: List[Keyword], countries: List[String])

case class Keyword(id: String, name: String)
