package dfp

import common.Box
import common.dfp.GuOrder
import concurrent.BlockingOperations

import scala.concurrent.{ExecutionContext, Future}

class OrderAgent(blockingOperations: BlockingOperations, dfpApi: DfpApi) {

  private lazy val cache = Box(Seq.empty[GuOrder])

  def refresh()(implicit executionContext: ExecutionContext): Future[Seq[GuOrder]] = {
    blockingOperations.executeBlocking(dfpApi.getAllOrders).flatMap { freshData =>
      cache.alter(if (freshData.nonEmpty) freshData else _)
    }
  }

  def get: Seq[GuOrder] = cache.get()
}
