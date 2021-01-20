package services

import akka.actor.ActorSystem
import concurrent.BlockingOperations
import org.scalatest.{FlatSpec, Matchers}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.mockito.MockitoSugar
import org.mockito.Mockito._

class ParameterStoreServiceTest extends FlatSpec with ScalaFutures with Matchers with MockitoSugar {

  "findParameterBySubstring" should "retrieve a parameter from the parameter store by substring" in {
    val actorSystem = ActorSystem()
    val blockingOperations = new BlockingOperations(actorSystem)

    val parameterStore = mock[ParameterStore]
    when(parameterStore.getPath("/frontend", isRecursiveSearch = true)) thenReturn Map(
      "key" -> "value",
      "some_test_key" -> "test_value",
      "test" -> "last_value",
    )

    val parameterStoreProvider = mock[ParameterStoreProvider]
    when(parameterStoreProvider.get) thenReturn parameterStore

    val parameterStoreService = new ParameterStoreService(parameterStoreProvider, blockingOperations)
    whenReady(parameterStoreService.findParameterBySubstring("test")) {
      _ shouldBe Seq("some_test_key", "test")
    }
  }

}
