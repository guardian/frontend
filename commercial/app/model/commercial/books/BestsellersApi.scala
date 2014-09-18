package model.commercial.books

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.Configuration.commercial.magento
import conf.Switches._
import model.commercial._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.xml.Elem

trait BestsellersApi extends ExecutionContexts with Logging {

  protected val category: String
  protected val keywordIds: Seq[String]

  final protected val adTypeName = s"$category Bestsellers"

  protected val path: String

  protected def url = CommercialConfiguration.getProperty("gu.bookshop.api.url") map (_ + path)

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
    FeedReader.readSeqFromXml[Book](FeedRequest(adTypeName, GuBookshopFeedsSwitch, url, timeout = 5.seconds))(parse)
  }

}

object GeneralBestsellersFeed extends BestsellersApi {
  protected lazy val category = "General"
  protected val keywordIds = Nil
  protected val path = "/Feed6.jsp"
}


object TravelBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Travel"
  protected val keywordIds = Seq("travel/travel", "books/travel-guides", "books/travel-writing")
  protected val path = "/Feed1.jsp"
}


object ScienceBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Science"
  protected val keywordIds = Seq("science/science", "books/scienceandnature")
  protected val path = "/Feed2.jsp"
}


object TechnologyBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Technology"
  protected val keywordIds = Seq("technology/technology")
  protected val path = "/Feed3.jsp"
}


object EnvironmentBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Environment"
  protected val keywordIds = Seq("environment/environment")
  protected val path = "/Feed4.jsp"
}


object SocietyBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Society"
  protected val keywordIds = Seq("society/society")
  protected val path = "/Feed5.jsp"
}


object PoliticsBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Politics"
  protected val keywordIds = Seq("politics/politics")
  protected val path = "/Feed7.jsp"
}


object MusicFilmBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Music & Film"
  protected val keywordIds = Seq("music/music", "film/film")
  protected val path = "/Feed8.jsp"
}


object SportBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Sport"
  protected val keywordIds = Seq("sport/sport", "books/sportandleisure", "football/football")
  protected val path = "/Feed9.jsp"
}


object HomeGardenBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Home & Garden"
  protected val keywordIds = Seq("lifeandstyle/homes", "books/houseandgarden", "money/homeimprovements")
  protected val path = "/Feed10.jsp"
}


object FoodDrinkBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Food & Drink"
  protected val keywordIds = Seq("lifeandstyle/food-and-drink", "travel/restaurants", "lifeandstyle/chefs")
  protected val path = "/Feed11.jsp"
}


// temporary implementation while waiting for new endpoint
object MagentoBestsellersFeed extends BestsellersApi {
  protected lazy val category = "General"
  protected val keywordIds = Nil
  protected val path = "bertrams/feed/independentsTop20"

  override protected def url: Option[String] = magento.domain map (domain => s"http://$domain/$path")

  override def loadBestsellers(): Future[Seq[Book]] = super.loadBestsellers() map {
    _ map (book => book.copy(jacketUrl = book.jacketUrl.map(_.stripPrefix("http:"))))
  }

}
