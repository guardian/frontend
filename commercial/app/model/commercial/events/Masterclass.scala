package model.commercial.events

import model.ImageElement
import model.commercial.events.Eventbrite._
import org.apache.commons.lang.StringUtils
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import org.jsoup.Jsoup
import org.jsoup.nodes.{Document, Element}

case class Masterclass(id: String,
                       name: String,
                       startDate: DateTime,
                       url: String,
                       description: String,
                       status: String,
                       venue: EBVenue,
                       tickets: Seq[EBTicket],
                       capacity: Int,
                       guardianUrl: String,
                       firstParagraph: String,
                       keywordIdSuffixes: Seq[String],
                       mainPicture: Option[ImageElement]) extends EBTicketHandler with EBEventHandler {

  lazy val readableDate = DateTimeFormat.forPattern("d MMMMM yyyy").print(startDate)

  lazy val truncatedFirstParagraph = StringUtils.abbreviate(firstParagraph, 250)
}

object Masterclass {
  private val guardianUrlLinkText = "Full course and returns information on the Masterclasses website"

  def apply(event: EBEvent): Option[Masterclass] = {

    val doc: Document = Jsoup.parse(event.description)

    def extractGuardianUrl: Option[String] = {
      val elements :Array[Element] = doc.select(s"a[href^=http://www.theguardian.com/]:contains($guardianUrlLinkText)")
          .toArray(Array.empty[Element])

      elements.headOption match {
        case Some(e) => Some(e.attr("href"))
        case _ => None
      }
    }

    def extractFirstParagraph(html: String) = {
      val firstParagraph: Option[Element] = Some(doc.select("p").first())
      firstParagraph match {
        case Some(p) => p.text
        case _ => ""
      }
    }

    extractGuardianUrl map { extractedUrl =>

      new Masterclass(
        id = event.id,
        name = event.name,
        startDate = event.startDate,
        url = event.url,
        description = event.description,
        status = event.status,
        venue = event.venue,
        tickets = event.tickets,
        capacity = event.capacity,
        guardianUrl = extractedUrl,
        firstParagraph = extractFirstParagraph(event.description),
        keywordIdSuffixes = Nil,
        mainPicture = None
      )
    }
  }
}
