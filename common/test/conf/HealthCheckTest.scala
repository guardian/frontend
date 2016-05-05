package conf

import common.AkkaAgent
import org.scalatest.{Matchers, FlatSpec}
import org.joda.time.DateTime
import scala.concurrent.duration._

class HealthCheckCacheTest extends FlatSpec with Matchers {

  private def cacheWithHealthCheckResults(results: List[HealthCheckResult]) = {
    val cacheState = results.map(r => r.url -> r).toMap
    new HealthCheckCache {
      override def testPort: Int = 1
      override val cache = AkkaAgent[Map[String, HealthCheckResult]](cacheState)
    }
  }

  "allSuccessful" should "return false if cache empty" in {
    val cache = cacheWithHealthCheckResults(List())
    cache.allSuccessful should be (false)
  }

  "allSuccessful" should "return true if all results are successful" in {
    val results = List(HealthCheckResult("/url", 200), HealthCheckResult("/another/url", 200))
    val cache = cacheWithHealthCheckResults(results)
    cache.allSuccessful should be (true)
  }

  "allSuccessful" should "return false if not all results are successful" in {
    val results = List(HealthCheckResult("/url", 404), HealthCheckResult("/another/url", 200))
    val cache = cacheWithHealthCheckResults(results)
    cache.allSuccessful should be (false)
  }

  "anySuccessful" should "return false if cache empty" in {
    val cache = cacheWithHealthCheckResults(List())
    cache.anySuccessful should be (false)
  }

  "anySuccessful" should "return true if one result is a success" in {
    val results = List(HealthCheckResult("/url", 404), HealthCheckResult("/another/url", 200))
    val cache = cacheWithHealthCheckResults(results)
    cache.anySuccessful should be (true)
  }
}

class HealthCheckResultTest extends FlatSpec with Matchers {

  "RecentlySucceed" should "return true if 200 and freshly created" in {
    val result = HealthCheckResult("/url", 200, DateTime.now)
    result.recentlySucceed should be (true)
  }

  "RecentlySucceed" should "return false if non 200 and freshly created" in {
    val result = HealthCheckResult("/url", 500, DateTime.now)
    result.recentlySucceed should be (false)
  }

  "RecentlySucceed" should "return false if 200 and expired" in {
    val expiration = 5.seconds
    val date = DateTime.now.minus(expiration.toMillis + 1)
    val result = HealthCheckResult("/url", 200, date, expiration)
    result.recentlySucceed should be (false)
  }

  "RecentlySucceed" should "return false if non 200 and expired" in {
    val expiration = 5.seconds
    val date = DateTime.now.minus(expiration.toMillis + 1)
    val result = HealthCheckResult("/url", 500, date, expiration)
    result.recentlySucceed should be (false)
  }

  "RecentlySucceed" should "return false if error happened and freshly created" in {
    val result = HealthCheckResult("/url", new RuntimeException(), DateTime.now)
    result.recentlySucceed should be (false)
  }

  "RecentlySucceed" should "return false if error happened and expired" in {
    val expiration = 5.seconds
    val date = DateTime.now.minus(expiration.toMillis + 1)
    val result = HealthCheckResult("/url", new RuntimeException(), date, expiration)
    result.recentlySucceed should be (false)
  }
}
