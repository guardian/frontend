package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._
import com.codahale.jerkson.Json

class MostPopularTest extends FlatSpec with ShouldMatchers {

  "Most Popular" should "render json" in HtmlUnit("/pages/most-popular/UK/world") { browser =>
    import browser._

    val html = Json.parse[Map[String, String]](pageSource).get("html")

    html should not be (None)

    html.foreach(_ should startWith("<div"))
  }

  it should "render tag headline" in HtmlUnit("/pages/most-popular/UK/world?callback=result") { browser =>
    import browser._

    pageSource should startWith("result({")
    pageSource should endWith("});");
  }
}