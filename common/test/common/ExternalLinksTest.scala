package common

import org.scalatest.{Inspectors}
import org.scalatest.matchers.should.Matchers
import ExternalLinks.external
import org.scalatest.flatspec.AnyFlatSpec

class ExternalLinksTest extends AnyFlatSpec with Matchers with Inspectors {
  val testPaths = Seq(
    "/sport/cycling",
    "/cities/2014/nov/24/equal-streets-happier-healthier-mumbai",
    "/commentisfree/all",
    "/sport?page=2",
  )

  "external" should "be false for relative URLs" in {
    forAll(testPaths ++ testPaths.map(_.stripPrefix("/"))) { id =>
      external(id) should be(false)
    }
  }

  it should "be false for absolute URLs to any Guardian origin domains" in {
    forAll(for {
      domain <- ExternalLinks.GuardianDomains
      path <- testPaths
    } yield domain + path) { id =>
      external(id) should be(false)
    }
  }

  it should "be false for absolute URLs to any Guardian subdomains" in {
    forAll(for {
      subdomain <- Seq("profile", "witness")
      domain <- ExternalLinks.GuardianDomains
      path <- testPaths
    } yield s"$subdomain.$domain$path") { id =>
      external(id) should be(false)
    }
  }

  it should "be true for other URLs" in {
    forAll(
      Seq(
        "http://www.bbc.co.uk/news/uk-30173238",
        "http://www.nytimes.com/2014/11/24/opinion/will-texas-kill-an-insane-man.html?hp&action=click&pgtype=Homepage&module=c-column-top-span-region&region=c-column-top-span-region&WT.nav=c-column-top-span-region&_r=0",
        "http://i.imgur.com/QRPYajQ.jpg",
      ),
    ) { id =>
      external(id) should be(true)
    }
  }

  it should "be false for malformed URLs" in {
    forAll(
      Seq(
        "htt://",
        "\u0000",
      ),
    ) { id =>
      external(id) should be(false)
    }
  }
}
