package article

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import common.{Server, Grunt}

class ArticleTest extends FlatSpec with ShouldMatchers {

  "Article" should "pass integration tests" in Server {
    Grunt("article") should be (0)
  }

}
