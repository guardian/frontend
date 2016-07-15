package services

import akka.actor.ActorSystem
import app.LifecycleComponent
import common.AutoRefresh
import model.{TagDefinition, TagIndexListings}
import play.libs.Akka

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.{Future, blocking}
import scala.language.postfixOps

class NewspaperBooksAndSectionsAutoRefresh extends LifecycleComponent {
  override def start(): Unit = {
    NewspaperBookTagAgent.start()
    NewspaperBookSectionTagAgent.start()
  }
}

trait NewspaperTags {
  val source: String
  def getTags(publication: String): Seq[TagDefinition] = {
    TagIndexesS3.getIndex(source, publication) match {
      case Right(tagPage) => tagPage.tags
      case _ => Seq.empty
    }
  }
}

class NewspaperBookTagAgent(actorSystem: => ActorSystem) extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes, actorSystem) with NewspaperTags {
  override val source = "newspaper_books"
  override protected def refresh(): Future[TagIndexListings] = Future {
    blocking {
      TagIndexesS3.getListingOrDie(source)
    }
  }
}

object NewspaperBookTagAgent extends NewspaperBookTagAgent(Akka.system())

class NewspaperBookSectionTagAgent(actorSystem: => ActorSystem) extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes, actorSystem) with NewspaperTags {
  override val source = "newspaper_book_sections"
  override protected def refresh(): Future[TagIndexListings] = Future {
    blocking {
      TagIndexesS3.getListingOrDie(source)
    }
  }
}

object NewspaperBookSectionTagAgent extends NewspaperBookSectionTagAgent(Akka.system())
