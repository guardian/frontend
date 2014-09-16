package model.commercial

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.Switches._
import model.commercial.money.MortgagesApi._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.xml.{Elem, XML}

package object money {

  trait MoneySupermarketApi[T <: Ad] extends Logging {

    protected val adTypeName: String

    protected val path: String

    final protected val url = {

      // this tracking code appears in the links to products
      val trackingCode = "GU15"

      CommercialConfiguration.getProperty("moneysupermarket.api.url") map {
        base => s"$base/bestbuys/$path/$trackingCode"
      }
    }

    protected def parse(xml: Elem): Seq[T]

    protected def cleanResponseBody(body: String): String = body

    def loadAds(): Future[Seq[T]] = {
      url map { u =>
        val result = FeedReader.read(FeedRequest(MoneysupermarketFeedsSwitch, u, timeout = 10.seconds)) { body =>
          val xml = XML.loadString(cleanResponseBody(body))
          parse(xml)
        }
        result map {
          case Left(FeedReadWarning(message)) =>
            log.warn(s"Reading $adTypeName feed failed: $message")
            Nil
          case Left(FeedReadException(message)) =>
            log.error(s"Reading $adTypeName feed failed: $message")
            Nil
          case Right(jobs) => jobs
          case other =>
            log.error(s"Something unexpected has happened: $other")
            Nil
        }
      } getOrElse {
        log.warn(s"Reading $adTypeName feed failed: missing URL")
        Future.successful(Nil)
      }
    }
  }


  trait MoneyAgent[T <: Ad] extends AdAgent[T] with ExecutionContexts {

    protected def loadProducts(): Future[Seq[T]]

    def refresh() {
      for {
        products <- loadProducts()
      } updateCurrentAds(products)
    }
  }

}
