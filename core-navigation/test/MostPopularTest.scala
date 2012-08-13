package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._
import com.codahale.jerkson.Json

class MostPopularTest extends FlatSpec with ShouldMatchers {

  "Most Popular" should "render a jsonp callback" in HtmlUnit("/most-popular/UK/world?callback=result") { browser =>
    import browser._

    pageSource should startWith("result({")
    pageSource should endWith("});");
  }
}