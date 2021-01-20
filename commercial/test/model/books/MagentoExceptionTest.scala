package commercial.model.merchandise.books

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.json.Json
import test.ConfiguredTestSuite

@DoNotDiscover class MagentoExceptionTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "apply" should "create a MagentoException from json" in {
    val json = Json.parse("""{"messages":{"error":[{"code":404,"message":"Resource not found."}]}}""")
    MagentoException(json) shouldBe Some(MagentoException(404, "Resource not found."))
  }

}
