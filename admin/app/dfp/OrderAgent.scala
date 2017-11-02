package dfp

import common.AkkaAgent
import common.dfp.GuOrder
import tools.BlockingOperations

import scala.concurrent.{ExecutionContext, Future}

class OrderAgent(blockingOperations: BlockingOperations, dfpApi: DfpApi) {

  private lazy val cache = AkkaAgent(Seq.empty[GuOrder])

  def refresh()(implicit executionContext: ExecutionContext): Future[Seq[GuOrder]] = {
    blockingOperations.executeBlocking(dfpApi.getAllOrders).map { freshData =>
      if (freshData.nonEmpty) freshData else cache.get
    }
  }

  def get: Seq[GuOrder] = cache.get()
}
