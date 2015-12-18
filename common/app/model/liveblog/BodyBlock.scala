package model.liveblog

import com.gu.contentapi.client.model.Blocks
import model.liveblog.BodyBlock._
import org.joda.time.DateTime

object BodyBlock {

  def make(maybeBlocks: Option[Blocks]): Seq[BodyBlock] =
    maybeBlocks.toSeq.flatMap { blocks =>
      blocks.body.toSeq.flatMap { maybeBodyBlocks =>
        maybeBodyBlocks.map { bodyBlock =>
          BodyBlock(bodyBlock.id, bodyBlock.bodyHtml, bodyBlock.bodyTextSummary, bodyBlock.title, bodyBlock.attributes, bodyBlock.published, bodyBlock.createdDate, bodyBlock.firstPublishedDate, bodyBlock.publishedDate, bodyBlock.lastModifiedDate, bodyBlock.contributors)
        }
      }
    }

  sealed trait EventType
  case object KeyEvent extends EventType
  case object SummaryEvent extends EventType
  case object UnclassifiedEvent extends EventType
}

case class BodyBlock(
  id: String,
  bodyHtml: String,
  bodyTextSummary: String,
  title: Option[String],
  attributes: Map[String, String],
  published: scala.Boolean,
  createdDate: Option[DateTime],
  firstPublishedDate: Option[DateTime],
  publishedDate: Option[DateTime],
  lastModifiedDate: Option[DateTime],
  contributors: Seq[String]
) {
  lazy val eventType: EventType =
    attributes.get("keyEvent") match {
      case Some("true") => KeyEvent
      case _ => attributes.get("summary") match {
        case Some("true") => SummaryEvent
        case _ => UnclassifiedEvent
      }
    }

  lazy val republishedDate: Option[DateTime] = {
    firstPublishedDate.flatMap { firstPublishedDate =>
      publishedDate.filter(_ != firstPublishedDate)
    }
  }
}
