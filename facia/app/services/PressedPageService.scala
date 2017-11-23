package services

import java.nio.ByteBuffer

import akka.actor.{ActorRef, ActorSystem}
import boopickle.Default._
import common.Logging
import concurrent.{BlockingOperations, FutureSemaphore}
import model.PressedPage
import protocol.BinaryPressedPageProtocol
import scala.concurrent.{ExecutionContext, Future}


class PressedPageService(actorSystem: ActorSystem, blockingOperations: BlockingOperations)
                        (implicit ec: ExecutionContext) extends Logging with BinaryPressedPageProtocol {

  private val concurrencyLimiterActor: ActorRef = FutureSemaphore.actorRef(15)(actorSystem, ec)

  def findPressedPage(path: String)(implicit ec: ExecutionContext): Future[Option[PressedPage]] = {
    FutureSemaphore.executeTask(concurrencyLimiterActor, findPressedPageFromS3(path))
  }

  private def findPressedPageFromS3(path: String): Future[Option[PressedPage]] = {
    blockingOperations.executeBlocking {
      S3.getBytes(path).map { bytes =>
        Unpickle[PressedPage].fromBytes(ByteBuffer.wrap(bytes))
      }
    }
  }
}
