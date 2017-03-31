package views.support

import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}

import org.apache.commons.lang.StringEscapeUtils

class CommercialMPUForFrontsTest extends FlatSpec with Matchers {

/*
 * The format we are using for the test data is treated as XML when toString()
 * is run on it. To parse it into a JSoup element, it is necessary to remove
 * all the XML character encodings that have been introduced.
 */
  private def parseTestData(doc: String): Document = {
    Jsoup.parse(StringEscapeUtils.unescapeXml(doc))
  }

  private def clean(document: Document): Document = {
    val cleaner = CommercialMPUForFronts(true)
    cleaner.clean(document)
    document
  }

  val frontWithThrasher = <html>
        <body>
          <section id="thrasher" class="fc-container fc-container--thrasher fc-container--first">
            <div class="fc-container__inner">
              <div class="fc-slice-wrapper">
                <ul class="u-unstyled l-row">
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                </ul>
              </div>
            </div>
          </section>
          <section class="fc-container">
            <div class="fc-container__inner">
              <div class="fc-slice-wrapper">
                <ul class="u-unstyled l-row">
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item fc-slice__item--mpu-candidate"></li>
                </ul>
              </div>
            </div>
          </section>
          <section class="fc-container">
            <div class="fc-container__inner">
              <div class="fc-slice-wrapper">
                <ul class="u-unstyled l-row">
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item fc-slice__item--mpu-candidate"></li>
                </ul>
              </div>
            </div>
          </section>
          <div class="fc-container fc-container--commercial">
            <div id="dfp-ad--merchandising-high" class="ad-slot--merchandising-high">
            </div>
          </div>
          <section class="fc-container">
            <div class="fc-container__inner">
              <div class="fc-slice-wrapper">
                <ul class="u-unstyled l-row">
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                </ul>
              </div>
            </div>
          </section>
          <section class="fc-container">
            <div class="fc-container__inner">
              <div class="fc-slice-wrapper">
                <ul class="u-unstyled l-row">
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                </ul>
              </div>
            </div>
          </section>
          <section class="fc-container">
            <div class="fc-container__inner">
              <div class="fc-slice-wrapper">
                <ul class="u-unstyled l-row">
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item"></li>
                  <li class="fc-slice__item l-row__item fc-slice__item--mpu-candidate"></li>
                </ul>
              </div>
            </div>
          </section>
          <section class="fc-container">
            <div class="fc-container__inner">
              <div class="fc-slice fc-slice--popular">
              </div>
            </div>
          </section>
          <div class="fc-container fc-container--commercial">
            <div id="dfp-ad--merchandising" class="ad-slot--merchandising ad-slot--commercial-component">
            </div>
          </div>
        </body>
      </html>.toString()

  val result = parseTestData(frontWithThrasher)
  val body = clean(result)

  it should "insert MPUs into applicable slices, and give them unique IDs" in {
    val desktopMPUs = body.getElementsByClass("fc-slice__item--mpu-candidate")
    desktopMPUs.size should be (3)
    desktopMPUs.first.toString should include ("dfp-ad--inline1")
    desktopMPUs.last.toString should include ("dfp-ad--inline3")
  }

  it should "insert MPUs for mobile view between sections, and give them unique IDs" in {
    val mobileMPUs = body.getElementsByClass("fc-container__mpu--mobile")
    mobileMPUs.size should be (2)
    mobileMPUs.first.toString should include ("dfp-ad--top-above-nav--mobile")
    mobileMPUs.last.toString should include ("dfp-ad--inline1--mobile")
  }

  it should "not count the first container, if it is a thrasher on a Network Front, when adding mobile MPUs" in {
    val thrasher = body.getElementsByClass("fc-container--first").first
    thrasher.id should be ("thrasher")

    val sectionAfterThrasher = thrasher.nextElementSibling()
    sectionAfterThrasher.hasClass("fc-container__mpu--mobile") should be (false)
  }

  it should "avoid inserting next to commercial containers when adding mobile MPUs" in {
    val commercialContainers = body.getElementsByClass("fc-container--commercial")
    commercialContainers.size should be (2)

    commercialContainers.first.nextElementSibling.hasClass("fc-container__mpu--mobile") should be (false)
    commercialContainers.first.previousElementSibling.hasClass("fc-container__mpu--mobile") should be (false)
    commercialContainers.last.previousElementSibling.hasClass("fc-container__mpu--mobile") should be (false)

    if (commercialContainers.last.nextElementSibling != null) {
      commercialContainers.last.nextElementSibling.hasClass("fc-container__mpu--mobile") should be (false)
    } else {
      commercialContainers.last.nextElementSibling should be (null)
    }

  }

}
