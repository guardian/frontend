package agents

import org.scalatest.BeforeAndAfterAll
import org.scalatest.concurrent.ScalaFutures.whenReady
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import test._

class PopularInTagAgentTest
  extends AnyFlatSpec
    with Matchers
    with SingleServerSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  lazy val agent = new PopularInTagAgent(testContentApiClient)

  "PopularInTagAgent" should "initialise with trails being an empty Seq" in {
    agent.onwardsJourneyResponse.trails shouldBe Seq.empty
  }

  "PopularInTagAgent" should "get two trails from CAPI" in {
    whenReady(agent.refresh()) { _ => agent.onwardsJourneyResponse.trails.size shouldBe 2 }

    //    agent.refresh().foreach( { Unit => string shouldBe("Hello") })
//    Await.result(refresh, 3.seconds)
  }
}
