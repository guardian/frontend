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
    val hhmm = useFormat("HH:mm", dateTime)
    val ampm = useFormat("h.mma", dateTime).toLowerCase(Locale.ENGLISH)
    val gmt = useFormat("z", dateTime)
    (fullDate, hhmm, ampm, gmt)
  }

  def useFormat(format: String, dateTime: DateTime)(implicit request: RequestHeader) =
    dateTime.toString(DateTimeFormat.forPattern(format).withZone(Edition(request).timezone))

}
