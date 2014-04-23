package model.commercial.travel

import org.scalatest.Matchers
import common.ExecutionContexts
import org.scalatest.FlatSpec
import scala.xml.XML

class OffersApiTest extends FlatSpec with Matchers with ExecutionContexts {

  val xml = XML.loadString {
    """
      |<guardianholidayoffers>
      |<offers count="377" generated="23-Apr-2014 10:04:46">
      |<offer uniqueidentifier="20c3ce9f-ed37-4f13-b2ef-00678067d734" id="5098" fromprice="645.00" duration="4" views="878" earliestdeparture="08-Jun-2014">
      |<position>1</position>
      |<prodUrl>http://www.guardianholidayoffers.co.uk/holiday/5098/country-houses-of-northamptonshire-and-lincolnshire</prodUrl>
      |<category>Tours</category>
      |<tag><![CDATA[Special interest holidays]]></tag>
      |<location><![CDATA[United Kingdom]]></location>
      |<prodId>5098</prodId>
      |<prodName><![CDATA[Country houses of Northamptonshire and Lincolnshire]]></prodName>
      |<by><![CDATA[Travel Editions]]></by>
      |<prodImage><![CDATA[http://www.guardianholidayoffers.co.uk/Image.aspx?id=37200&type=NoResize]]></prodImage>
      |<firstSentenceDescription><![CDATA[]]></firstSentenceDescription>
      |<rrp></rrp>
      |<actualPrice><![CDATA[From £645.00]]></actualPrice>
      |<savingsDiscount></savingsDiscount>
      |<inStock>yes</inStock>
      |</offer>
      |<offer uniqueidentifier="147c847b-8665-4246-8e52-023fd141fcf9" id="3421" fromprice="999.00" duration="7" views="9843" earliestdeparture="02-May-2014">
      |<position>2</position>
      |<prodUrl>http://www.guardianholidayoffers.co.uk/holiday/3421/italian-riviera</prodUrl>
      |<category>Tours</category>
      |<tag><![CDATA[Rail holidays ]]></tag>
      |<tag><![CDATA[Tours]]></tag>
      |<location><![CDATA[Italy]]></location>
      |<prodId>3421</prodId>
      |<prodName><![CDATA[Italian Riviera by rail]]></prodName>
      |<by><![CDATA[Travel Editions]]></by>
      |<prodImage><![CDATA[http://www.guardianholidayoffers.co.uk/Image.aspx?id=27156&type=NoResize]]></prodImage>
      |<firstSentenceDescription><![CDATA[]]></firstSentenceDescription>
      |<rrp></rrp>
      |<actualPrice><![CDATA[From £999.00]]></actualPrice>
      |<savingsDiscount></savingsDiscount>
      |<inStock>yes</inStock>
      |</offer>
      |<offer uniqueidentifier="4b7000d8-34d7-4514-82ac-03b9cdb0add6" id="3381" fromprice="699.00" duration="5" views="20153" earliestdeparture="08-Oct-2014">
      |<position>3</position>
      |<prodUrl>http://www.guardianholidayoffers.co.uk/holiday/3381/lake-annecy-les-grillons-hotel-half-board-</prodUrl>
      |<category>Tours</category>
      |<tag><![CDATA[Tours]]></tag>
      |<tag><![CDATA[Rail holidays ]]></tag>
      |<location><![CDATA[France]]></location>
      |<prodId>3381</prodId>
      |<prodName><![CDATA[Lake Annecy by rail ]]></prodName>
      |<by><![CDATA[Travel Editions]]></by>
      |<prodImage><![CDATA[http://www.guardianholidayoffers.co.uk/Image.aspx?id=27167&type=NoResize]]></prodImage>
      |<firstSentenceDescription><![CDATA[]]></firstSentenceDescription>
      |<rrp></rrp>
      |<actualPrice><![CDATA[From £699.00]]></actualPrice>
      |<savingsDiscount></savingsDiscount>
      |<inStock>yes</inStock>
      |</offer>
      |</offers>
      |</guardianholidayoffers>
    """.stripMargin
  }

  private val api = new OffersApi {
    protected lazy val path: String = "test"
    protected val adTypeName: String = "test"
  }

  "OffersApi" should "build Offers from XML" in {
    val offers = api.parse(xml)
    offers should be(Fixtures.untaggedOffers)
  }

  "Hydrated Offers" should "provide duration in words" in {
    val offers = api.parse(xml)

    offers.find(_.id == 2).head.durationInWords should be("5 nights")
    offers.find(_.id == 0).head.durationInWords should be("4 nights")
  }

}
