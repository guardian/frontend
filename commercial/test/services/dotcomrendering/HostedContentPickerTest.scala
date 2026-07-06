package services.dotcomrendering

import conf.switches.Switches
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import services.dotcomrendering.LocalRender
import test.TestRequest

@DoNotDiscover class HostedContentPickerTest extends AnyFlatSpec with Matchers {
  "Hosted Content Picker decideTier" should "return LocalRender if the feature switch is off" in {
    Switches.DCRHostedContent.switchOff()
    val testRequest = TestRequest("hosted-content-path")
    val tier = HostedContentPicker.decideTier()(testRequest)
    tier should be(LocalRender)
  }

  it should "return LocalRender if forcing DCR to be off via the query parameter" in {
    val testRequest = TestRequest("hosted-content-path?dcr=false")
    val tier = HostedContentPicker.decideTier()(testRequest)
    tier should be(LocalRender)
  }

  it should "return RemoteRender if forcing DCR to be on via the query parameter" in {
    val testRequest = TestRequest("hosted-content-path?dcr=true")
    val tier = HostedContentPicker.decideTier()(testRequest)
    tier should be(RemoteRender)
  }

  it should "return RemoteRender otherwise" in {
    val testRequest = TestRequest("hosted-content-path")
    val tier = HostedContentPicker.decideTier()(testRequest)
    tier should be(RemoteRender)
  }
}
