package layout

import java.util.Locale

import common.Edition
import model.Content.BodyBlocks
import model.Content.BodyBlocks.{KeyEvent, UnclassifiedEvent, SummaryEvent}
import org.joda.time._
import org.joda.time.format._
import play.api.mvc.RequestHeader

object BlockFields {

  def apply(block: BodyBlocks) = block.eventType match {
    case SummaryEvent => " is-summary"
    case KeyEvent => " is-key-event"
    case UnclassifiedEvent => ""
  }

}

object LiveBlogDateFormat {

  def apply(dateTime: DateTime)(implicit request: RequestHeader) = {
    val fullDate = ISODateTimeFormat.dateTime().withZone(DateTimeZone.UTC).print(dateTime)
    val hhmm = dateTime.toString(DateTimeFormat.forPattern("HH:mm").withZone(Edition(request).timezone))
    val ampm = dateTime.toString(DateTimeFormat.forPattern("h.mma").withZone(Edition(request).timezone)).toLowerCase(Locale.ENGLISH)
    val gmt = dateTime.toString(DateTimeFormat.forPattern("z").withZone(Edition(request).timezone))
    (fullDate, hhmm, ampm, gmt)
  }

}
