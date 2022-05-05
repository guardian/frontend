package commercial.model.merchandise.books

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.DoNotDiscover
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.Json
import test.ConfiguredTestSuite

@DoNotDiscover class MagentoExceptionTest extends AnyFlatSpec with Matchers with ConfiguredTestSuite {

  "apply" should "create a MagentoException from json" in {
    val json = Json.parse("""{"messages":{"error":[{"code":404,"message":"Resource not found."}]}}""")
    MagentoException(json) shouldBe Some(MagentoException(404, "Resource not found."))
  }

}
