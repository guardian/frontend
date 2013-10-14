package model.travel

import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import scala.xml.Node

case class Offer(id: Int, title: Option[String], offerUrl: String, imageUrl: String, fromPrice: String,
                 earliestDeparture: DateTime, keywords: List[Keyword], countries: List[String])

object Offer {

  private val dateFormat = DateTimeFormat.forPattern("dd-MMM-yyyy")

  def apply(id: Int, node: Node): Offer = {
    Offer(
      id,
      Some((node \\ "title").text),
      (node \\ "offerurl").text,
      (node \\ "imageurl").text
        .replace("NoResize", "ThreeColumn")
        .replace("http://www.guardianholidayoffers.co.uk/Image.aspx",
        "http://resource.guim.co.uk/travel/holiday-offers-micro/image"),
      (node \ "@fromprice").text.replace(".00", ""),
      dateFormat.parseDateTime((node \ "@earliestdeparture").text),
      Nil,
      (node \\ "country").map(_.text).toList
    )
  }

}

case class Keyword(id: String, name: String)
