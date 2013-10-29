package model.commercial.travel

import org.scalatest.Matchers
import scala.concurrent.{Await, Future}
import common.ExecutionContexts
import scala.concurrent.duration._
import org.scalatest.FlatSpec
import scala.xml.XML

class OffersApiTest extends FlatSpec with Matchers with ExecutionContexts {

  val xml = Future(XML.loadString {
    """
      |<guardianholidayoffers>
      |<offers count="273" generated="15-Oct-2013 13:59:37">
      |<offer uniqueidentifier="3912b269-209e-4799-b5a6-02a961b21d2d" id="4980" fromprice="5595.00" duration="12" views="448" earliestdeparture="12-Jan-2014">
      |<offerurl><![CDATA[http://www.guardianholidayoffers.co.uk/holiday/4980/southern-tanzania]]></offerurl>
      |<imageurl><![CDATA[http://www.guardianholidayoffers.co.uk/Image.aspx?id=33679&type=NoResize]]></imageurl>
      |<seoname><![CDATA[southern-tanzania]]></seoname>
      |<newspapercode><![CDATA[]]></newspapercode>
      |<supplier><![CDATA[Travel Editions]]></supplier>
      |<supplierurl><![CDATA[http://www.guardianholidayoffers.co.uk/travel-editions]]></supplierurl>
      |<title><![CDATA[Southern Tanzania]]></title>
      |<subtitle><![CDATA[]]></subtitle>
      |<introduction><![CDATA[Explore the undiscovered wilds of southern Tanzania on this wonderful tour, with awe inspiring safaris in both the game-packed Ruaha National Park and Selous Game Reserve. Spectacular animal viewing, luxurious camps and even a night sleeping out under the stars in the bush combine to make this a truly exceptional safari experience. ]]></introduction>
      |<categories>
      |<category><![CDATA[Adventure holidays]]></category>
      |<category><![CDATA[Sun holidays]]></category>
      |</categories>
      |<countries>
      |<country><![CDATA[Tanzania]]></country>
      |</countries>
      |<departures>
      |<departure date="12-Jan-2014" fromprice="5595.00" places="4" />
      |<departure date="07-Sep-2014" fromprice="5595.00" places="4" />
      |<departure date="05-Oct-2014" fromprice="5595.00" places="4" />
      |</departures>
      |</offer>
      |<offer uniqueidentifier="0738ca21-32c0-4c0d-9203-057fd6769da9" id="3552" fromprice="979.00" duration="7" views="38442" earliestdeparture="29-Apr-2014">
      |<offerurl><![CDATA[http://www.guardianholidayoffers.co.uk/holiday/3552/lake-maggiore-orta-and-the-matterhorn]]></offerurl>
      |<imageurl><![CDATA[http://www.guardianholidayoffers.co.uk/Image.aspx?id=26842&type=NoResize]]></imageurl>
      |<seoname><![CDATA[lake-maggiore-orta-and-the-matterhorn]]></seoname>
      |<newspapercode><![CDATA[GDNMA]]></newspapercode>
      |<supplier><![CDATA[Riviera Travel]]></supplier>
      |<supplierurl><![CDATA[http://www.guardianholidayoffers.co.uk/riviera-travel]]></supplierurl>
      |<title><![CDATA[Lake Maggiore, Orta & the Matterhorn]]></title>
      |<subtitle><![CDATA[]]></subtitle>
      |<introduction><![CDATA[Enjoy our wonderful escorted tour to stunning Lake Maggiore and see charming Orta and the spectacular Matterhorn]]></introduction>
      |<categories>
      |<category><![CDATA[Tours]]></category>
      |</categories>
      |<countries>
      |<country><![CDATA[Italy]]></country>
      |<country><![CDATA[Switzerland]]></country>
      |</countries>
      |<departures>
      |<departure date="29-Apr-2014" fromprice="1049.00" places="16" />
      |<departure date="29-Apr-2014" fromprice="1049.00" places="28" />
      |<departure date="29-Apr-2014" fromprice="1049.00" places="48" />
      |<departure date="29-Apr-2014" fromprice="1049.00" places="50" />
      |<departure date="06-May-2014" fromprice="1059.00" places="50" />
      |<departure date="06-May-2014" fromprice="1079.00" places="42" />
      |<departure date="06-May-2014" fromprice="1059.00" places="46" />
      |<departure date="06-May-2014" fromprice="1059.00" places="28" />
      |<departure date="06-May-2014" fromprice="1059.00" places="12" />
      |<departure date="13-May-2014" fromprice="1069.00" places="11" />
      |<departure date="13-May-2014" fromprice="1069.00" places="25" />
      |<departure date="13-May-2014" fromprice="1069.00" places="46" />
      |<departure date="13-May-2014" fromprice="1069.00" places="48" />
      |<departure date="20-May-2014" fromprice="1069.00" places="48" />
      |<departure date="20-May-2014" fromprice="1069.00" places="42" />
      |<departure date="20-May-2014" fromprice="1089.00" places="39" />
      |<departure date="20-May-2014" fromprice="1069.00" places="44" />
      |<departure date="27-May-2014" fromprice="1069.00" places="48" />
      |<departure date="27-May-2014" fromprice="1069.00" places="24" />
      |<departure date="27-May-2014" fromprice="1069.00" places="16" />
      |<departure date="03-Jun-2014" fromprice="1069.00" places="20" />
      |<departure date="03-Jun-2014" fromprice="1069.00" places="20" />
      |<departure date="03-Jun-2014" fromprice="1069.00" places="43" />
      |<departure date="10-Jun-2014" fromprice="1069.00" places="47" />
      |<departure date="10-Jun-2014" fromprice="1069.00" places="3" />
      |<departure date="10-Jun-2014" fromprice="1069.00" places="38" />
      |<departure date="17-Jun-2014" fromprice="1069.00" places="16" />
      |<departure date="17-Jun-2014" fromprice="1069.00" places="46" />
      |<departure date="17-Jun-2014" fromprice="1069.00" places="44" />
      |<departure date="17-Jun-2014" fromprice="1089.00" places="42" />
      |<departure date="17-Jun-2014" fromprice="1069.00" places="48" />
      |<departure date="24-Jun-2014" fromprice="1069.00" places="44" />
      |<departure date="24-Jun-2014" fromprice="1069.00" places="10" />
      |<departure date="24-Jun-2014" fromprice="1069.00" places="30" />
      |<departure date="01-Jul-2014" fromprice="1049.00" places="18" />
      |<departure date="01-Jul-2014" fromprice="1049.00" places="18" />
      |<departure date="01-Jul-2014" fromprice="1049.00" places="48" />
      |<departure date="01-Jul-2014" fromprice="1049.00" places="50" />
      |<departure date="08-Jul-2014" fromprice="1009.00" places="50" />
      |<departure date="08-Jul-2014" fromprice="1029.00" places="48" />
      |<departure date="08-Jul-2014" fromprice="1009.00" places="46" />
      |<departure date="15-Jul-2014" fromprice="1009.00" places="44" />
      |<departure date="15-Jul-2014" fromprice="1009.00" places="48" />
      |<departure date="15-Jul-2014" fromprice="1009.00" places="8" />
      |<departure date="15-Jul-2014" fromprice="1009.00" places="26" />
      |<departure date="15-Jul-2014" fromprice="1009.00" places="50" />
      |<departure date="22-Jul-2014" fromprice="1009.00" places="26" />
      |<departure date="22-Jul-2014" fromprice="1009.00" places="18" />
      |<departure date="22-Jul-2014" fromprice="1009.00" places="48" />
      |<departure date="22-Jul-2014" fromprice="1009.00" places="47" />
      |<departure date="29-Jul-2014" fromprice="1009.00" places="42" />
      |<departure date="29-Jul-2014" fromprice="1029.00" places="48" />
      |<departure date="29-Jul-2014" fromprice="1009.00" places="18" />
      |<departure date="29-Jul-2014" fromprice="1009.00" places="30" />
      |<departure date="29-Jul-2014" fromprice="1009.00" places="50" />
      |<departure date="05-Aug-2014" fromprice="1009.00" places="49" />
      |<departure date="05-Aug-2014" fromprice="1009.00" places="50" />
      |<departure date="05-Aug-2014" fromprice="1009.00" places="48" />
      |<departure date="12-Aug-2014" fromprice="1009.00" places="26" />
      |<departure date="12-Aug-2014" fromprice="1009.00" places="20" />
      |<departure date="12-Aug-2014" fromprice="1009.00" places="50" />
      |<departure date="19-Aug-2014" fromprice="1029.00" places="50" />
      |<departure date="19-Aug-2014" fromprice="1049.00" places="50" />
      |<departure date="19-Aug-2014" fromprice="1029.00" places="50" />
      |<departure date="19-Aug-2014" fromprice="1029.00" places="26" />
      |<departure date="19-Aug-2014" fromprice="1029.00" places="13" />
      |<departure date="26-Aug-2014" fromprice="1059.00" places="24" />
      |<departure date="26-Aug-2014" fromprice="1059.00" places="16" />
      |<departure date="26-Aug-2014" fromprice="1059.00" places="48" />
      |<departure date="26-Aug-2014" fromprice="1059.00" places="45" />
      |<departure date="02-Sep-2014" fromprice="1099.00" places="42" />
      |<departure date="02-Sep-2014" fromprice="1099.00" places="48" />
      |<departure date="02-Sep-2014" fromprice="1099.00" places="10" />
      |<departure date="02-Sep-2014" fromprice="1099.00" places="22" />
      |<departure date="09-Sep-2014" fromprice="1119.00" places="48" />
      |<departure date="09-Sep-2014" fromprice="1099.00" places="50" />
      |<departure date="09-Sep-2014" fromprice="1099.00" places="50" />
      |<departure date="16-Sep-2014" fromprice="1099.00" places="48" />
      |<departure date="16-Sep-2014" fromprice="1099.00" places="40" />
      |<departure date="16-Sep-2014" fromprice="1099.00" places="14" />
      |<departure date="16-Sep-2014" fromprice="1099.00" places="26" />
      |<departure date="23-Sep-2014" fromprice="1099.00" places="30" />
      |<departure date="23-Sep-2014" fromprice="1099.00" places="16" />
      |<departure date="23-Sep-2014" fromprice="1099.00" places="50" />
      |<departure date="23-Sep-2014" fromprice="1099.00" places="50" />
      |<departure date="30-Sep-2014" fromprice="1079.00" places="50" />
      |<departure date="30-Sep-2014" fromprice="1079.00" places="20" />
      |<departure date="30-Sep-2014" fromprice="1079.00" places="30" />
      |<departure date="30-Sep-2014" fromprice="1079.00" places="48" />
      |<departure date="30-Sep-2014" fromprice="1099.00" places="48" />
      |<departure date="07-Oct-2014" fromprice="989.00" places="30" />
      |<departure date="07-Oct-2014" fromprice="989.00" places="20" />
      |<departure date="07-Oct-2014" fromprice="989.00" places="50" />
      |<departure date="07-Oct-2014" fromprice="989.00" places="50" />
      |<departure date="14-Oct-2014" fromprice="989.00" places="50" />
      |<departure date="14-Oct-2014" fromprice="989.00" places="50" />
      |<departure date="14-Oct-2014" fromprice="989.00" places="48" />
      |<departure date="21-Oct-2014" fromprice="979.00" places="20" />
      |<departure date="21-Oct-2014" fromprice="979.00" places="30" />
      |<departure date="21-Oct-2014" fromprice="979.00" places="50" />
      |<departure date="21-Oct-2014" fromprice="999.00" places="50" />
      |</departures>
      |</offer>
      |<offer uniqueidentifier="9dfb3305-c3c0-4a8c-9769-06274888605a" id="5037" fromprice="1284.00" duration="7" views="665" earliestdeparture="02-Nov-2013">
      |<offerurl><![CDATA[http://www.guardianholidayoffers.co.uk/holiday/5037/horse-riding-holiday-for-intermediate-and-experienced-riders]]></offerurl>
      |<imageurl><![CDATA[http://www.guardianholidayoffers.co.uk/Image.aspx?id=33819&type=NoResize]]></imageurl>
      |<seoname><![CDATA[horse-riding-holiday-for-intermediate-and-experienced-riders]]></seoname>
      |<newspapercode><![CDATA[]]></newspapercode>
      |<supplier><![CDATA[GoLearnTo]]></supplier>
      |<supplierurl><![CDATA[http://www.guardianholidayoffers.co.uk/go-learn-to]]></supplierurl>
      |<title><![CDATA[Horse riding holiday for intermediate and experienced riders]]></title>
      |<subtitle><![CDATA[Immerse yourself in a wide variety of delightful activities on this unique 6 night / 7 day horse riding and wine tasting holiday set in a spectacular region of France. Spend your mornings visiting local riding schools and exploring the beautiful surroundings on easy hacks and relaxing trail rides. Horses are carefully selected to suit your specific needs and you will experience the unspoilt orchards, woodland and hilltops on horseback. ]]></subtitle>
      |<introduction><![CDATA[Experience the best that Bergerac has to offer on this flexible 7 night/8 day horse riding holiday located just a 20 minute drive from Bergerac airport, in a peaceful and serene unrivalled area of the Dordogne countryside.
      |
      |Spend your days on varied and spectacular rides, exploring luscious meadows, vineyards, forests and rivers on horseback and enjoy long energetic trots and thrilling canters. Rides will also take place through many stunning private chateaux estates where you might stop for a delicious picnic or sample the estates wine selection. This is a very flexible riding holiday so you can choose how much or little riding you want to do each day and you will see a lot of the natural beauty of the Dordogne on your rides, and cover a larger terrain than your average riding holiday. ]]></introduction>
      |<categories>
      |<category><![CDATA[Learning holidays]]></category>
      |<category><![CDATA[Sports holidays]]></category>
      |<category><![CDATA[Special interest holidays]]></category>
      |</categories>
      |<countries>
      |<country><![CDATA[France]]></country>
      |</countries>
      |<departures>
      |<departure date="02-Nov-2013" fromprice="1284.00" places="500" />
      |</departures>
      |</offer>
      |</offers>
      |</guardianholidayoffers>
    """.stripMargin
  })

  "OffersApi" should "build Offers from XML" in {
    val offers = Await.result(OffersApi.getAllOffers(xml), atMost = 1.seconds)
    offers should be(Fixtures.untaggedOffers)
  }

}
