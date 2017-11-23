package model

import java.nio.ByteBuffer

import helpers.FaciaTestData
import org.scalatest.{Assertion, FlatSpec, Matchers}
import boopickle.Default._
import play.api.libs.json.Json
import protocol.BinaryPressedPageProtocol

class PressedPageTest extends FlatSpec with FaciaTestData with Matchers with BinaryPressedPageProtocol {

  def assertSerailiseDeserialise(pressedPage: PressedPage): Assertion = {
    val serialisedBytes: Array[Byte] = Pickle.intoBytes(ukFaciaPage).array()
    val deserialised: PressedPage = Unpickle[PressedPage].fromBytes(ByteBuffer.wrap(serialisedBytes))

    Json.toJson(deserialised) shouldBe Json.toJson(ukFaciaPage)
  }

  "Binary serialisation and deserialisation" should "serialise and deserialise to the same object" in {
    assertSerailiseDeserialise(ukFaciaPage)
    assertSerailiseDeserialise(usFaciaPage)
    assertSerailiseDeserialise(auFaciaPage)
    assertSerailiseDeserialise(ukCultureFaciaPage)
    assertSerailiseDeserialise(usCultureFaciaPage)
    assertSerailiseDeserialise(auCultureFaciaPage)
  }
}
