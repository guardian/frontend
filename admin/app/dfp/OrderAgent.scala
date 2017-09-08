package dfp

import common.AkkaAgent
import common.dfp.GuOrder

import scala.concurrent.{ExecutionContext, Future}

object OrderAgent {

  private lazy val cache = AkkaAgent(Seq.empty[GuOrder])

  def refresh()(implicit executionContext: ExecutionContext): Future[Seq[GuOrder]] = {
    cache alterOff { oldData =>
      val freshData = DfpApi.getAllOrders
      if (freshData.nonEmpty) freshData else oldData
    }
  }

  def get: Seq[GuOrder] = cache.get()
}
