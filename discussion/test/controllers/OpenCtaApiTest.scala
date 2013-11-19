package controllers

import org.scalatest.FunSuite
import scala.concurrent.{Await, Future}
import play.api.libs.json.{JsString, JsValue, Json}
import scala.concurrent.duration.Duration
import org.scalatest.time.Seconds
import java.util.concurrent.TimeUnit
import com.fasterxml.jackson.databind.JsonNode

class OpenCtaApiTest extends FunSuite {


  test("That we can actually fetch top comment"){

//    val expectedComent = "ikenna is handsome"
//
//    val result:Future[JsValue] = new OpenCtaApi {}.getTopComment()
//
//    val json = Await.result(result, Duration(1, TimeUnit.SECONDS))
//
//    val values: String = (json \\ "body").as[String]
//    val actual:String =  Json.stringify(values)
//
//
//
//
//
//
//    assert(expectedComment ===  actual)
  }

  test("Fetch body"){

    val actual = (commentJson \\ "body")(0)
    val expected =  JsString("<p>In terms of the diversity and originality of hi</p>")
    println("type is ===== " + actual.getClass)
    assert(expected === actual)
  }


  private val commentJson: JsValue = Json.parse( """{
    "apiUrl": "http://discussion.guardianapis.com/discussion-api/comment/28656413",
    "body": "<p>In terms of the diversity and originality of hi</p>",
    "date": "07 November 2013 11:59am",
    "id": 28656413,
    "isHighlighted": true,
    "isoDateTime": "2013-11-07T11:59:46Z",
    "numRecommends": 8,
    "numResponses": 1,
    "status": "visible",
    "userProfile": {
      "apiUrl": "http://discussion.guardianapis.com/discussion-api/profile/4235958",
      "avatar": "http://static.guim.co.uk/sys-images/discussion/avatars/2010/09/23/JamesDavid/0663561f-c609-43e2-a713-0c0006c1ec45/60x60.png",
      "badge": [],
      "displayName": "JamesDavid",
      "secureAvatarUrl": "https://static-secure.guim.co.uk/sys-images/discussion/avatars/2010/09/23/JamesDavid/0663561f-c609-43e2-a713-0c0006c1ec45/60x60.png",
      "userId": "4235958",
      "webUrl": "http://www.theguardian.com/discussion/user/id/4235958"
    },
    "webUrl": "http://discussion.theguardian.com/comment-permalink/28656413"
  }""")
}



