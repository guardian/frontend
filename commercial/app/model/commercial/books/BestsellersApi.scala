package model.commercial.books

import model.commercial.XmlAdsApi
import model.commercial.OptString
import conf.{CommercialConfiguration, Switches}
import scala.xml.Elem

trait BestsellersApi extends XmlAdsApi[Book] {

  final protected val switch = Switches.GuBookshopFeedsSwitch

  protected val category: String
  protected val keywords: Seq[String]

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
            replace("http://images.bertrams.com/", "http://c.guim.co.uk/books/")),
          buyUrl = Some((book \ "bookurl").text),
          position = Some((entry \ "Position").text).map(_.toInt),
          Some(category),
          keywords
        )
    }
  }
}


object GeneralBestsellersFeed extends BestsellersApi {
  protected lazy val category = "General"
  protected val keywords = Nil
  protected val path = "/Feed6.jsp"
}


object TravelBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Travel"
  protected val keywords = Seq("Travel guides", "Travel writing")
  protected val path = "/Feed1.jsp"
}


object ScienceBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Science"
  protected val keywords = Seq("Science and nature")
  protected val path = "/Feed2.jsp"
}


object TechnologyBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Technology"
  protected val keywords = Seq("Technology")
  protected val path = "/Feed3.jsp"
}


object EnvironmentBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Environment"
  protected val keywords = Seq("Environment")
  protected val path = "/Feed4.jsp"
}


object SocietyBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Society"
  protected val keywords = Seq("Society")
  protected val path = "/Feed5.jsp"
}


object PoliticsBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Politics"
  protected val keywords = Seq("Politics")
  protected val path = "/Feed7.jsp"
}


object MusicFilmBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Music & Film"
  protected val keywords = Seq("Music", "Film")
  protected val path = "/Feed8.jsp"
}


object SportBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Sport"
  protected val keywords = Seq("Sport and leisure")
  protected val path = "/Feed9.jsp"
}


object HomeGardenBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Home & Garden"
  protected val keywords = Seq("Homes", "House and garden", "Home improvements")
  protected val path = "/Feed10.jsp"
}


object FoodDrinkBestsellersFeed extends BestsellersApi {
  protected lazy val category = "Food & Drink"
  protected val keywords = Seq("Food and drink")
  protected val path = "/Feed11.jsp"
}
