package dfp

import common.AkkaAgent
import common.dfp.GuCreativeTemplate
import tools.BlockingOperations

import scala.concurrent.{ExecutionContext, Future}

class CreativeTemplateAgent(blockingOperations: BlockingOperations, dfpApi: DfpApi) {

  private lazy val cache = AkkaAgent(Seq.empty[GuCreativeTemplate])

  def refresh()(implicit executionContext: ExecutionContext): Future[Seq[GuCreativeTemplate]] = {
    blockingOperations.executeBlocking(dfpApi.readActiveCreativeTemplates()).flatMap { freshData =>
      cache.alter(if (freshData.nonEmpty) freshData else _)
    }
  }

  def get: Seq[GuCreativeTemplate] = cache.get()
}
