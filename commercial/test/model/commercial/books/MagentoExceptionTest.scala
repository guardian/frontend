package model.commercial.books

import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.Json

class MagentoExceptionTest extends FlatSpec with Matchers {

  "apply" should "create a MagentoException from json" in {
    val json = Json.parse( """{"messages":{"error":[{"code":404,"message":"Resource not found."}]}}""")
    MagentoException(json) shouldBe Some(MagentoException(404, "Resource not found."))
  }

}
