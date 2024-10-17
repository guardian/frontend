package cricket.feed

import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import conf.cricketPa.PaFeed
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.concurrent.{IntegrationPatience, ScalaFutures}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import test.{
  ConfiguredTestSuite,
  WithMaterializer,
  WithTestApplicationContext,
  WithTestExecutionContext,
  WithTestWsClient,
}

@DoNotDiscover class CricketPaDeserialisationTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestExecutionContext
    with ScalaFutures
    with IntegrationPatience {
  val actorSystem = PekkoActorSystem()
  val paFeed = new PaFeed(wsClient, actorSystem, materializer)

  whenReady(paFeed.getMatch("39145392-3f2e-8022-35f3-eac0b0654610")) { cricketMatch =>
    {
      cricketMatch.innings.head.batters.head.howOut shouldBe ""

    }
  }
}
