package model

import java.nio.ByteBuffer

import helpers.FaciaTestData
import org.scalatest.{Assertion, FlatSpec, Matchers}
import boopickle.Default._
import protocol.BinaryPressedPageProtocol

class PressedPageTest extends FlatSpec with FaciaTestData with Matchers with BinaryPressedPageProtocol {

  def assertSerailiseDeserialise(pressedPage: PressedPage): Assertion = {
    val array = Pickle.intoBytes(ukFaciaPage).array()
    val pressedPage = Unpickle[PressedPage].fromBytes(ByteBuffer.wrap(array))

    pressedPage.toString.replace("Vector", "List") shouldBe ukFaciaPage.toString.replace("Vector", "List")
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
