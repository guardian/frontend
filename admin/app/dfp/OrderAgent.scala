package dfp

import common.AkkaAgent
import common.dfp.GuOrder
import tools.BlockingOperations

import scala.concurrent.{ExecutionContext, Future}

class OrderAgent(blockingOperations: BlockingOperations, dfpApi: DfpApi) {

  private lazy val cache = AkkaAgent(Seq.empty[GuOrder])

  def refresh()(implicit executionContext: ExecutionContext): Future[Seq[GuOrder]] = {
    blockingOperations.executeBlocking(dfpApi.getAllOrders).flatMap { freshData =>
      cache.alter(if (freshData.nonEmpty) freshData else _)
    }
  }

  def get: Seq[GuOrder] = cache.get()
}
