package services.dotcomrendering

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import services.dotcomrendering.{LocalRender, RemoteRender}
import test.TestRequest

@DoNotDiscover class HostedContentPickerTest extends AnyFlatSpec with Matchers {
  "Hosted Content Picker decideTier" should "return LocalRender if forceDCROff" in {
    val testRequest = TestRequest("hosted-content-path?dcr=false")
    val tier = HostedContentPicker.decideTier()(testRequest)
    tier should be(LocalRender)
  }

  it should "return RemoteRender if force DCR and in the test group commercial-hosted-content:preview" in {
    val testRequest = TestRequest("hosted-content-path?dcr=true&ab-commercial-hosted-content:preview")
    val tier = HostedContentPicker.decideTier()(testRequest)
    tier should be(LocalRender)
  }

  it should "return LocalRender if force DCR and NOT in the test group commercial-hosted-content:preview" in {
    val testRequest = TestRequest("hosted-content-path?dcr=true")
    val tier = HostedContentPicker.decideTier()(testRequest)
    tier should be(LocalRender)
  }

  it should "return LocalRender otherwise" in {
    val testRequest = TestRequest("hosted-content-path")
    val tier = HostedContentPicker.decideTier()(testRequest)
    tier should be(LocalRender)
  }
}
