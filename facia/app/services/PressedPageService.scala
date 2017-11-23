package services

import java.nio.ByteBuffer
import boopickle.Default._
import common.Logging
import concurrent.{BlockingOperations, FutureSemaphore}
import model.PressedPage
import protocol.BinaryPressedPageProtocol
import scala.concurrent.{ExecutionContext, Future}


class PressedPageService(blockingOperations: BlockingOperations)
                        (implicit ec: ExecutionContext) extends Logging with BinaryPressedPageProtocol {

  private val futureSemaphore = new FutureSemaphore(15)

  def findPressedPage(path: String)(implicit ec: ExecutionContext): Future[Option[PressedPage]] = {
    futureSemaphore.execute(findPressedPageFromS3(path))
  }

  private def findPressedPageFromS3(path: String): Future[Option[PressedPage]] = {
    blockingOperations.executeBlocking {
      S3.getBytes(path).map { bytes =>
        Unpickle[PressedPage].fromBytes(ByteBuffer.wrap(bytes))
      }
    }
  }
}
