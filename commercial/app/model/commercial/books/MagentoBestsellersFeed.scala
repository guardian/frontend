package model.commercial.books

import java.lang.System._

import commercial.feeds._
import common.{ExecutionContexts, Logging}
import model.commercial._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal
import scala.xml.{Elem, XML}

object MagentoBestsellersFeed extends ExecutionContexts with Logging {

  def parse(xml: Elem): Seq[Book] = {
    xml \ "Entry" map {
      entry =>
        val book = entry \ "book"

        def getPrice(eltName: String): Option[Double] = Some((book \ eltName).text).map(_.stripPrefix("£").toDouble)

        Book(
          title = (book \ "title").text,
          author = OptString((book \ "author").text),
          isbn = (book \ "isbn").text,
          price = getPrice("price"),
          offerPrice = getPrice("offerprice"),
          description = OptString((book \ "description").text),
          jacketUrl = (book \ "jacketurl").headOption.map(node => s"http:${node.text}".
            replace("http://images.bertrams.com/ProductImages/services/GetImage", "http://c.guim.co.uk/books")),
          buyUrl = Some((book \ "bookurl").text),
          position = Some((entry \ "Position").text).map(_.toInt),
          Some("General"),
          Nil
        )
    }
  }

  def loadBestsellers(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[Book]] = {

    val feedName = feedMetaData.name

    feedMetaData.switch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        feedContent map { body =>
          val parsed = parse(XML.loadString(body)).map { book =>
            book.copy(jacketUrl = book.jacketUrl.map(_.stripPrefix("http:")))
          }
          Future(ParsedFeed(parsed, Duration(currentTimeMillis - start, MILLISECONDS)))
        } getOrElse {
          Future.failed(MissingFeedException(feedName))
        }
      } else {
        Future.failed(SwitchOffException(feedMetaData.switch.name))
      }
    } recoverWith {
      case NonFatal(e) => Future.failed(e)
    }
  }
}
