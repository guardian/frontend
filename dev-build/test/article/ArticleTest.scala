package article

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import common.{Server, Grunt}

class ArticleTest extends FlatSpec with Matchers {

  "Article" should "pass integration tests" in Server {
    Grunt("article") should be (0)
  }

}
