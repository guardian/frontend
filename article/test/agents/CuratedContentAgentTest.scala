package agents

import com.gu.contentapi.client.utils.format.NewsPillar
import common.editions.International
import org.scalatest.BeforeAndAfterAll
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import test._

import scala.concurrent.Await
import scala.concurrent.duration._

class CuratedContentAgentTest
    extends AnyFlatSpec
    with Matchers
    with SingleServerSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient
    with WithTestFrontJsonFapi {

  private val frontPaths =
    List("uk", "us", "world-test-2-do-not-edit", "international", "us/sport", "au", "us-news")

  "CuratedContentAgentTest" should "initialise with trails being an empty Seq" in {
    val curatedContentAgent = new CuratedContentAgent(fapi)
    curatedContentAgent.getCuratedContent shouldBe Map.empty
  }

  "CuratedContentAgentTest" should "not be empty after refresh" in {
    val curatedContentAgent = new CuratedContentAgent(fapi)
    Await.result(curatedContentAgent.refreshPaths(frontPaths), 4.second)
    curatedContentAgent.getCuratedContentAdFree.size should be > (0)
    curatedContentAgent.getTrails(NewsPillar, International, true).size should be > (0)
  }

}
