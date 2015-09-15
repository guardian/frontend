package model.commercial.books

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.Configuration.commercial.magento
import conf.switches.Switches._
import model.commercial._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.xml.Elem

trait BestsellersApi extends ExecutionContexts with Logging {

  protected val category: String
  protected val keywordIds: Seq[String]

  final protected val adTypeName = s"$category Bestsellers"

  protected val path: String

  protected def maybeUrl = CommercialConfiguration.getProperty("gu.bookshop.api.url") map (_ + path)

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
          Some(category),
          keywordIds
        )
    }
  }

  def loadBestsellers(): Future[Seq[Book]] = {
    maybeUrl map { url =>
      val request = FeedRequest(
        feedName = adTypeName,
        switch = GuBookshopFeedsSwitch,
        url,
        timeout = 5.seconds)
      FeedReader.readSeqFromXml[Book](request)(parse)
    } getOrElse {
      Future.failed(FeedMissingConfigurationException(adTypeName))
    }
  }

}


// temporary implementation while waiting for new endpoint
object MagentoBestsellersFeed extends BestsellersApi {
  protected lazy val category = "General"
  protected val keywordIds = Nil
  protected val path = "bertrams/feed/independentsTop20"

  override protected def maybeUrl: Option[String] = magento.domain map (domain =>
    s"http://$domain/$path")

  override def loadBestsellers(): Future[Seq[Book]] = super.loadBestsellers() map {
    _ map (book => book.copy(jacketUrl = book.jacketUrl.map(_.stripPrefix("http:"))))
  }

}
