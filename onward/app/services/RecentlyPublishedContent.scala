package services

import akka.actor._
import scala.concurrent.duration._
import scala.language.postfixOps

import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.libs.concurrent._

import akka.util.Timeout
import akka.pattern.ask

import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import model.Content
import common.Logging

object RecentlyPublished {
  
  implicit private val timeout = Timeout(2 seconds)
  
  private lazy val default = {
    Akka.system.actorOf(Props[RecentlyPublished],"RecentlyPublished")
  }

  def subscribe(): scala.concurrent.Future[(Iteratee[JsValue,_],Enumerator[JsValue])] = {

    default ? Subscribe map {
      
      case Connected(enumerator) => 
      
        // Create an Iteratee to consume(ignore) data from the client.
        val iteratee = Iteratee.ignore[JsValue].map { _ =>
          default ! Quit
        }

        // Use the actor's enumerator to send messages to the client.
        (iteratee,enumerator)
        
      case CannotConnect(error) =>

        // A finished Iteratee sending EOF
        val iteratee = Done[JsValue,Unit]((),Input.EOF)

        // Send an error and close the socket
        val enumerator =  Enumerator[JsValue](JsObject(Seq("error" -> JsString(error)))).andThen(Enumerator.enumInput(Input.EOF))
        
        (iteratee,enumerator)
    }
  }

  def publish(content: Content) {
    default ! Notify(content)
  }
}

class RecentlyPublished extends Actor with Logging {
  
  var members: Int = 0
  val (contentEnumerator, contentChannel) = Concurrent.broadcast[JsValue]

  // Receive requests from clients to subscribe and unsubscribe.
  def receive = {
    
    case Subscribe => {
      if(members > 200) {
        log.info("Cannot subscribe to recently published, connections exhausted.")
        sender ! CannotConnect("Max number of connections made")
      } else {
        members = members + 1
        sender ! Connected(contentEnumerator)
        log.info(s"Subscribed to recently published success. Members = $members")
      }
    }

    case Notify(content) => {
      // Send new content to all subscribers.
      val msg = JsObject(
        Seq(
          "headline" -> JsString(content.headline),
          "url" -> JsString(content.url)
        )
      )
      contentChannel.push(msg)
    }

    case Quit => {
      members = members - 1
      log.info(s"Unsubscribed from recently published. Members = $members")
    }
  }
}

case class Subscribe()
case class Quit()
case class Notify(content: Content)

case class Connected(enumerator:Enumerator[JsValue])
case class CannotConnect(msg: String)
