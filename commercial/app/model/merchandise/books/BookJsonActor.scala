package model.merchandise.books

import akka.actor.{Actor, Props}
import commercial.model.merchandise.books.MagentoService
import common.Logging
import play.api.libs.json.JsValue

import scala.concurrent.ExecutionContext

class BookJsonActor(magentoService: MagentoService) extends Actor with Logging {

  implicit val ec: ExecutionContext = context.system.dispatcher

  private var bookCache: Map[String, JsValue] = Map[String, JsValue]()

  def receive: PartialFunction[Any, Unit] = {
    case isbn: String => {

      bookCache.get(isbn) match {
        case Some(json) => {
          log.info(s"Cache hit for ISBN: $isbn.")
          sender() ! Some(json)
        }
        case None => magentoService.findByIsbn(isbn) map (_.foreach { book: JsValue => bookCache += (isbn -> book) })
          log.info(s"Cache miss for ISBN: $isbn. Looking up ISBN with Magento Service.")
          sender () ! None
      }
    }
  }
}

object BookJsonActor {

  def props(magentoService: MagentoService) = Props(classOf[BookJsonActor], magentoService)
}
