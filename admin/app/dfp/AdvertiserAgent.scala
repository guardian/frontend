package dfp

import common.Box
import common.dfp.GuAdvertiser
import concurrent.BlockingOperations

import scala.concurrent.{ExecutionContext, Future}

class AdvertiserAgent(blockingOperations: BlockingOperations, dfpApi: DfpApi) {

  private lazy val cache = Box(Seq.empty[GuAdvertiser])

  def refresh()(implicit executionContext: ExecutionContext): Future[Seq[GuAdvertiser]] = {
    blockingOperations.executeBlocking(dfpApi.getAllAdvertisers).flatMap { freshData =>
      cache.alter(if (freshData.nonEmpty) freshData else _)
    }
  }

  def get: Seq[GuAdvertiser] = cache.get()
}
