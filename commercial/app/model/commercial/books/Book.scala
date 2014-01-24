package model.commercial.books

import model.commercial.{AdAgent, XmlAdsApi, Segment, Ad}
import scala.xml.Elem
import conf.{CommercialConfiguration, Switches}
import common.ExecutionContexts

case class Book(title: String,
                author: String,
                isbn: String,
                price: Double,
                offerPrice: Double,
                description: String,
                jacketUrl: String,
                buyUrl: String)
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}


object BestsellersApi extends XmlAdsApi[Book] {

  protected val switch = Switches.GuBookshopFeedsSwitch

  protected val adTypeName = "Books"

  protected def url = CommercialConfiguration.getProperty("gu.bookshop.api.url") map (_ + "/Feed6.jsp")

  def parse(xml: Elem): Seq[Book] = {
    xml \ "Entry" \ "book" map {
      book =>
        Book(
          (book \ "title").text,
          (book \ "author").text,
          (book \ "isbn").text,
          (book \ "price").text.toDouble,
          (book \ "offerprice").text.toDouble,
          (book \ "description").text,
          "http:" + (book \ "jacketurl").text,
          (book \ "bookurl").text
        )
    }
  }
}


object BestsellersAgent extends AdAgent[Book] with ExecutionContexts {

  def refresh() {
    for {
      books <- BestsellersApi.loadAds()
    } updateCurrentAds(books take 5)
  }
}
