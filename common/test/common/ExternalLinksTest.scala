package common

import org.scalatest.{Inspectors, Matchers, FlatSpec}
import ExternalLinks.external

class ExternalLinksTest extends FlatSpec with Matchers with Inspectors {
  val testDomains = Seq(
    "theguardian.com",
    "www.theguardian.com",
    "dev-theguardian.com",
    "code.dev-theguardian.com"
  )

  val testPaths = Seq(
    "/sport/cycling",
    "/cities/2014/nov/24/equal-streets-happier-healthier-mumbai",
    "/commentisfree/all",
    "/sport?page=2"
  )

  "external" should "be false for relative URLs" in {
    forAll(testPaths ++ testPaths.map(_.stripPrefix("/"))) { id =>
      external(id) should be(false)
    }
  }

  it should "be false for absolute URLs to any Guardian origin domains" in {
    forAll(for {
      domain <- testDomains
      path <- testPaths
    } yield domain + path) { id =>
      external(id) should be(false)
    }
  }

  it should "be false for profile.theguardian.com" in {
    external("http://profile.theguardian.com") should be(false)
  }

  it should "be false for witness.theguardian.com" in {
    external("http://witness.theguardian.com") should be(false)
  }

  it should "be true for other URLs" in {
    forAll(Seq(
      "http://www.bbc.co.uk/news/uk-30173238",
      "http://www.nytimes.com/2014/11/24/opinion/will-texas-kill-an-insane-man.html?hp&action=click&pgtype=Homepage&module=c-column-top-span-region&region=c-column-top-span-region&WT.nav=c-column-top-span-region&_r=0",
      "http://i.imgur.com/QRPYajQ.jpg"
    )) { id =>
      external(id) should be(true)
    }
  }

  it should "be false for malformed URLs" in {
    forAll(Seq(
      "htt://",
      "\0"
    )) { id =>
      external(id) should be(false)
    }
  }
}
