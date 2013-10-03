package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class cricketMatchControllerTest extends FlatSpec with ShouldMatchers {

  val cricketUrl = "sport/cricket/match/34780"
  val matchId = "34780"

  it should "return match results for a valid match Id" in Fake {
    val fakeRequest = FakeRequest(GET, s"${cricketUrl}")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.CricketMatchController.renderMatchId(matchId)(fakeRequest)
    status(result) should be(200)
    contentAsString(result) should include("Caught Michael Clarke Bowled Ashton Agar")
  }

  it should "return JSON when .json format is requested" in Fake {
    val fakeRequest = FakeRequest("GET", s"${cricketUrl}.json")
      .withHeaders("Host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.CricketMatchController.renderMatchId(matchId)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"summary\"")
  }
}
