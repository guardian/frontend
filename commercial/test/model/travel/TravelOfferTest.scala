package commercial.model.merchandise.travel

import commercial.model.merchandise.TravelOffer
import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.xml.Elem

class TravelOfferTest extends AnyFlatSpec with Matchers {

  private val xml: Elem =
    <product vibeid="a08878776d1429a5109064d64b5fda05"
             fromprice="3999.00"
             currencycode="GBP"
             earliestdeparture="2016-10-14"
             duration="21">
      <name>
        <![CDATA[New Zealand - Land of the Long White Cloud]]>
      </name>
      <url>
        <![CDATA[https://holidays.theguardian.com/collection/new-zealand---land-of-the-long-white-cloud-a08878776d1429a5109064d64b5fda05]]>
      </url>
      <image>
        <![CDATA[https://holidays.theguardian.com/tourimg.php?a=img&img=92b6c4fcb13dab1da639805c87aea979]]>
      </image>
      <tags>
        <tag group="City" tagid="auckland">
          <![CDATA[Auckland]]>
        </tag>
        <tag group="Area" tagid="australasia">
          <![CDATA[Australasia]]>
        </tag>
        <tag group="City" tagid="christchurch">
          <![CDATA[Christchurch]]>
        </tag>
        <tag group="Holiday Type" tagid="escortedtours">
          <![CDATA[Escorted tours]]>
        </tag>
        <tag group="Transport" tagid="fly">
          <![CDATA[Flight]]>
        </tag>
        <tag group="Promotions" tagid="inspireme">
          <![CDATA[Inspire me]]>
        </tag>
        <tag group="Airport" tagid="londonheathrow">
          <![CDATA[London Heathrow]]>
        </tag>
        <tag group="Airport" tagid="manchesterairport">
          <![CDATA[Manchester Airport ]]>
        </tag>
        <tag group="Country" tagid="New Zealand">
          <![CDATA[New Zealand]]>
        </tag>
        <tag group="Partner" tagid="rivieratravel">
          <![CDATA[Riviera Travel ]]>
        </tag>
      </tags>
      <supplier>
        <![CDATA[Riviera]]>
      </supplier>
    </product>

  "fromXml" should "generate a Travel Offer from a valid XML element" in {
    TravelOffer.fromXml(xml) shouldBe TravelOffer(
      id = "a08878776d1429a5109064d64b5fda05",
      title = "New Zealand - Land of the Long White Cloud",
      offerUrl =
        "https://holidays.theguardian.com/collection/new-zealand---land-of-the-long-white-cloud-a08878776d1429a5109064d64b5fda05",
      imageUrl = "https://holidays.theguardian.com/tourimg.php?a=img&img=92b6c4fcb13dab1da639805c87aea979",
      fromPrice = Some(3999.0),
      earliestDeparture = DateTime.parse("2016-10-14"),
      keywordIdSuffixes = Nil,
      countries = Seq("New Zealand"),
      category = Some("Escorted tours"),
      tags = Nil,
      duration = Some(21),
      position = -1,
    )
  }
}
