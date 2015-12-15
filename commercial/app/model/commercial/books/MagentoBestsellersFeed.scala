package model.commercial.books

import java.lang.System._

import commercial.feeds.{MissingFeedException, ParsedFeed, SwitchOffException}
import common.{ExecutionContexts, Logging}
import conf.Configuration.commercial.merchandisingFeedsLatest
import conf.switches.Switches
import model.commercial._
import services.S3

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

  def loadBestsellers(): Future[ParsedFeed[Book]] = {

    val feedName = "general-bestsellers"

    Switches.GuBookshopFeedsSwitch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        S3.get(s"$merchandisingFeedsLatest/$feedName") map { body =>
          val parsed = parse(XML.loadString(body)).map { book =>
            book.copy(jacketUrl = book.jacketUrl.map(_.stripPrefix("http:")))
          }
          Future(ParsedFeed(parsed, Duration(currentTimeMillis - start, MILLISECONDS)))
        } getOrElse {
          Future.failed(MissingFeedException(feedName))
        }
      } else {
        Future.failed(SwitchOffException(Switches.JobFeedSwitch.name))
      }
    } recoverWith {
      case NonFatal(e) => Future.failed(e)
    }
  }
}
