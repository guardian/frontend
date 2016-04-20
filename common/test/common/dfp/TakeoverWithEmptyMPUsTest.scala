package common.dfp

import org.scalatest.{FlatSpec, Matchers, OptionValues}
import play.api.data.validation.{Invalid, Valid}

class TakeoverWithEmptyMPUsTest extends FlatSpec with Matchers {

  "TakeoverWithEmptyMPUs" should "recognise as valid urls that are at least 1 directory deep" in {
    TakeoverWithEmptyMPUs.mustBeAtLeastOneDirectoryDeep("http://www.theguardian.com/uk") should equal(Valid)
  }

  "TakeoverWithEmptyMPUs" should "recognise as valid urls that have multiple directories deep" in {
    TakeoverWithEmptyMPUs.mustBeAtLeastOneDirectoryDeep("http://www.theguardian.com/abc/def/ghi") should equal(Valid)
  }

  "TakeoverWithEmptyMPUs" should "recognise as invalid urls that have no path" in {
    TakeoverWithEmptyMPUs.mustBeAtLeastOneDirectoryDeep("http://www.theguardian.com") should equal(Invalid("Must be at least one directory deep. eg: http://www.theguardian.com/us"))
  }

  "TakeoverWithEmptyMPUs" should "recognise as invalid urls that have a naked slash path" in {
    TakeoverWithEmptyMPUs.mustBeAtLeastOneDirectoryDeep("http://www.theguardian.com/") should equal(Invalid("Must be at least one directory deep. eg: http://www.theguardian.com/us"))
  }

  "TakeoverWithEmptyMPUs" should "recognise as invalid urls that are invalid" in {
    TakeoverWithEmptyMPUs.mustBeAtLeastOneDirectoryDeep("123") should equal(Invalid("Must be a valid URL. eg: http://www.theguardian.com/us"))
  }

  "TakeoverWithEmptyMPUs" should "recognise as invalid urls that are empty" in {
    TakeoverWithEmptyMPUs.mustBeAtLeastOneDirectoryDeep("") should equal(Invalid("Must be a valid URL. eg: http://www.theguardian.com/us"))
  }

  "TakeoverWithEmptyMPUs" should "recognise as invalid urls that are empty beyond the naked slash" in {
    TakeoverWithEmptyMPUs.mustBeAtLeastOneDirectoryDeep("http://www.theguardian.com/ ") should equal(Invalid("Must be at least one directory deep. eg: http://www.theguardian.com/us"))
  }

  "TakeoverWithEmptyMPUs" should "recognise as invalid urls that are empty beyond the root" in {
    TakeoverWithEmptyMPUs.mustBeAtLeastOneDirectoryDeep("http://www.theguardian.com ") should equal(Invalid("Must be at least one directory deep. eg: http://www.theguardian.com/us"))
  }
}
