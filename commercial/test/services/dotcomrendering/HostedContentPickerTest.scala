package services.dotcomrendering

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import services.dotcomrendering.{LocalRender, RemoteRender}
import test.TestRequest

@DoNotDiscover class HostedContentPickerTest extends AnyFlatSpec with Matchers {
  // All tests should return LocalRender initially

  "Hosted Content Picker decideTier" should "return LocalRender if forceDCROff and dcr cannot render" in {
    val testRequest = TestRequest("hosted-content-path?dcr=false")
    val tier = HostedContentPicker.decideTier(false)(testRequest)
    tier should be(LocalRender)
  }

  it should "return LocalRender if forceDCROff and dcrCanRender" in {
    val testRequest = TestRequest("hosted-content-path?dcr=false")
    val tier = HostedContentPicker.decideTier(false)(testRequest)
    tier should be(LocalRender)
  }

  it should "return LocalRender if force DCR" in {
    val testRequest = TestRequest("hosted-content-path?dcr=true")
    val tier = HostedContentPicker.decideTier(false)(testRequest)
    tier should be(LocalRender)
  }

  it should "return LocalRender if force DCR and content should be served pressed" in {
    val testRequest = TestRequest("hosted-content-path?dcr=true")
    val tier = HostedContentPicker.decideTier(true)(testRequest)
    tier should be(LocalRender)
  }

  it should "return LocalRender otherwise" in {
    val testRequest = TestRequest("hosted-content-path")
    val tier = HostedContentPicker.decideTier(false)(testRequest)
    tier should be(LocalRender)
  }
}
