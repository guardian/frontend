package model.commercial.books

import model.commercial.XmlAdsApi
import model.commercial.OptString
import conf.{CommercialConfiguration, Switches}
import scala.xml.Elem

trait BestsellersApi extends XmlAdsApi[Book] {

  final protected val switch = Switches.GuBookshopFeedsSwitch

  protected val category: String
  protected val keywordIds: Seq[String]

  final protected val adTypeName = s"$category Bestsellers"

  protected val path: String

  final protected def url = CommercialConfiguration.getProperty("gu.bookshop.api.url") map (_ + path)

  override protected val loadTimeout = 5000

  def parse(xml: Elem): Seq[Book] = {

    xml \ "Entry" map {
      entry =>
        val book = entry \ "book"
        Book(
          title = (book \ "title").text,
          author = OptString((book \ "author").text),
          isbn = (book \ "isbn").text,
          price = Some((book \ "price").text).map(_.toDouble),
          offerPrice = (book \ "offerprice").headOption.map(_.text).map(_.toDouble),
          description = OptString((book \ "description").text),
          jacketUrl = (book \ "jacketurl").headOption.map(node => (s"http:${node.text}").
            replace("http://images.bertrams.com/ProductImages/services/GetImage", "http://c.guim.co.uk/books")),
          buyUrl = Some((book \ "bookurl").text),
          position = Some((entry \ "Position").text).map(_.toInt),
          Some(category),
          keywordIds
        )
    }
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
