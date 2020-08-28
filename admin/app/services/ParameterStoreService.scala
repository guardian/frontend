package services

import javax.inject.Provider

import concurrent.BlockingOperations
import conf.Configuration

import scala.concurrent.Future

class ParameterStoreService(parameterStoreProvider: ParameterStoreProvider, blockingOperations: BlockingOperations) {
  private lazy val parameterStore = parameterStoreProvider.get

  def findParameterBySubstring(substring: String): Future[Seq[String]] =
    blockingOperations.executeBlocking {
      parameterStore
        .getPath("/frontend", isRecursiveSearch = true)
        .collect {
          case (key, _) if key.contains(substring) => key
        }
        .toSeq
    }
}

class ParameterStoreProvider extends Provider[ParameterStore] {
  override lazy val get: ParameterStore = new ParameterStore(Configuration.aws.region)
}
