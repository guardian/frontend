package conf

import common.ExecutionContexts
import org.scalatest.{WordSpec, Matchers}
import play.api.mvc.{AnyContent, Action, Result}
import play.api.test.FakeRequest
import play.api.test.Helpers._
import test.SingleServerSuite
import org.scalatest.concurrent.ScalaFutures
import scala.concurrent.Future

class CachedHealthCheckControllerTest extends WordSpec with Matchers with SingleServerSuite with ScalaFutures with ExecutionContexts {

  sealed trait HealthCheckType
  object HealthCheckTypes {
    object All extends HealthCheckType
    object Any extends HealthCheckType
  }

  // Test helper method
  def getHealthCheck(mockResults: List[HealthCheckResult], `type`: HealthCheckType)(testBlock: Future[Result] => Unit) = {

    // Create a CachedHealthCheckController with mock results
    val controller = new CachedHealthCheckController {
      override val paths: Seq[String] = mockResults.map(_.url)
      override val testPort: Int = 9000
      override def healthCheck(): Action[AnyContent] = `type` match {
        case HealthCheckTypes.All => healthCheckAll()
        case HealthCheckTypes.Any => healthCheckAny()
      }
      override val cache = new HealthCheckCache {
        override def fetchResults(testPort: Int, paths: String*): Future[Seq[HealthCheckResult]] = {
          Future.successful(mockResults)
        }
      }
    }
    // 2. Run the fetch to populate the cache and wait for it to finish
    whenReady(controller.runChecks) { _ =>
      // 3. Call the /_healthcheck endpoint on this controller
      val healthCheckRequest = FakeRequest(method = "GET", path = "/_healthcheck")
      val response = call(controller.healthCheck(), healthCheckRequest)
      // 4. Pass the response to the testBlock
      testBlock(response)
    }
  }

  "GET /_healthcheck" when {
    "all requests must be successful and cache results is empty" should {
      "503" in {
        getHealthCheck(List(), HealthCheckTypes.All) { response =>
          status(response) should be(503)
        }
      }
    }
    "all requests must be successful and cached results are all successful" should {
      "200" in {
        val mockResults = List(HealthCheckResult("/url", Right(200)), HealthCheckResult("/another/url", Right(200)))
        getHealthCheck(mockResults, HealthCheckTypes.All) { response =>
          status(response) should be (200)
        }
      }
    }
    "all requests must be successful and only one cached result is successful" should {
      "503" in {
        val mockResults = List(HealthCheckResult("/url", Right(200)), HealthCheckResult("/another/url", Right(500)))
        getHealthCheck(mockResults, HealthCheckTypes.All) { response =>
          status(response) should be (503)
        }
      }
    }
    "at least one succesful request is required and one cached results is successful" should {
      "200" in {
        val mockResults = List(HealthCheckResult("/url", Right(200)), HealthCheckResult("/another/url", Right(500)))
        getHealthCheck(mockResults, HealthCheckTypes.Any) { response =>
          status(response) should be (200)
        }
      }
    }
    "at least one succesful request is required and no cached result is successful" should {
      "503" in {
        val mockResults = List(HealthCheckResult("/url", Right(404)), HealthCheckResult("/another/url", Right(500)))
        getHealthCheck(mockResults, HealthCheckTypes.Any) { response =>
          status(response) should be (503)
        }
      }
    }
  }

}
