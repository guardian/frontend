package model.commercial.books

import org.scalatest.concurrent._
import org.scalatest.time.{Millis, Span, Seconds}
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.{JsNull, JsValue, Json}

import scala.collection.mutable
import scala.concurrent.Future

class BookFinderTest extends FlatSpec with Matchers with ScalaFutures {

  private implicit val defaultPatience =
    PatienceConfig(timeout = Span(2, Seconds), interval = Span(5, Millis))

  private case class TestCache(delegate: mutable.Map[String, JsValue]) extends BookDataCache {

    def get(isbn: String): Future[Option[JsValue]] = Future.successful(delegate.get(isbn))

    def add(isbn: String, json: JsValue): Future[Boolean] =
      Future.successful(delegate.put(isbn, json).isDefined)
  }

  private object FailingCache extends BookDataCache {
    def get(isbn: String): Future[Option[JsValue]] = Future.failed(new RuntimeException)
    def add(isbn: String, json: JsValue): Future[Boolean] = Future.failed(new RuntimeException)
  }

  private val book = Book(
    title = "Cameron's Coup",
    author = Some("Polly Toynbee & David Walker"),
    isbn = "9781783350438",
    price = Some(9.99),
    offerPrice = Some(7.992),
    jacketUrl = Some(
      "http://d935jy3y59lth.cloudfront" +
        ".net/media/catalog/product/cache/0/image/17f82f742ffe127f42dca9de82fb58b1/c/a" +
        "/cameron_s_coup.jpg"),
    buyUrl = Some("http://bookshop.theguardian.com/index.php/cameron-s-coup.html"),
    position = Some(3),
    category = Some("Politics")
  )

  private val bookJson = Json.parse(
    "{\"sku\":\"5038495116475\",\"isbn\":\"9781783350438\",\"name\":\"Cameron's " +
      "Coup\",\"author_firstname\":\"Polly Toynbee &\",\"author_lastname\":\"David Walker\"," +
      "\"bestseller_rank\":\"16.0000\",\"guardian_bestseller_rank\":\"3.0000\"," +
      "\"categories\":[{\"name\":\"Politics\",\"bic\":\"GTD,GTJC,JP,JPA,JPB,JPF,JPFB,JPFC,JPFF," +
      "JPFK,JPFM,JPFN,JPFP,JPFQ,JPH,JPHC,JPHF,JPHJ,JPHL,JPHV,JPHX,JPL,JPLM,JPP,JPQ,JPQB,JPR,JPRB," +
      "JPS,JPSD,JPSH,JPSK,JPSL,JPSN,JPSN1,JPSN2,JPV,JPVH,JPVH1,JPVH2,JPVH3,JPVH4,JPVM,JPVM1," +
      "JPVM3,JPVM5,JPVM7,JPVM71,JPVT,JPW,JPWD,JP\"},{\"name\":\"Political history\"," +
      "\"bic\":\"JPFB,JPFC,JPFF,JPFK,JPFM,JPFN,JPFP,JPWL1,JPHL\"},{\"name\":\"General\"," +
      "\"bic\":\"GB,GT,GZ,VSF,VSG,JPHF,JPA,JPB,JPF,JPFQ,JPH,JWA,JPFB,JPFC,JPFF,JPFK,JPFM,JPFN," +
      "JPFP,CGU,GB,GBA,GBC,GBCB,GBCR,GBCS,GBCT,GBCY,GL,GLC,GLF,GLH,GLK,GLM,GLP,GLR,GLT,GM,GRF," +
      "GRQD,GRS,HBTB,JDFC,VSF,VSK,VSL,VSN,VSR,VSW,JDC,JDCC,JDCF,JD\"},{\"name\":\"503s\"," +
      "\"bic\":null},{\"name\":\"Current affairs \",\"bic\":null},{\"name\":\"Independents\"," +
      "\"bic\":null},{\"name\":\"Guardian published books\",\"bic\":null},{\"name\":\"Guardian " +
      "Faber\",\"bic\":null},{\"name\":\"The best books to read before you vote\",\"bic\":null}]," +
      "\"images\":[\"http://d935jy3y59lth.cloudfront" +
      ".net/media/catalog/product/cache/0/image/17f82f742ffe127f42dca9de82fb58b1/c/a" +
      "/cameron_s_coup.jpg\"],\"product_url\":\"http://bookshop.theguardian.com/index" +
      ".php/cameron-s-coup.html\",\"regular_price_with_tax\":\"9.9900\"," +
      "\"regular_price_without_tax\":\"9.9900\",\"final_price_with_tax\":7.992," +
      "\"final_price_without_tax\":7.992}")

  private def populatedCache: BookDataCache = {
    TestCache(mutable.Map(
      "9781783350438" -> bookJson,
      "12345" -> JsNull
    ))
  }

  private def emptyCache: BookDataCache = {
    TestCache(mutable.Map.empty)
  }

  private def testLookup(isbn: String): Future[Option[JsValue]] = {
    isbn match {
      case "9781783350438" => Future.successful(Some(bookJson))
      case "12345" => Future.successful(None)
      case _ => Future.failed(new RuntimeException)
    }
  }

  "findByIsbn" should "give some book when it's in cache" in {
    val result = BookFinder.findByIsbn("9781783350438", populatedCache, testLookup)
    result.futureValue should be(Some(book))
  }

  it should "give none when it's stored as not-found in cache" in {
    val result = BookFinder.findByIsbn("12345", populatedCache, testLookup)
    result.futureValue should be(None)
  }

  it should "use lookup when cache get fails" in {
    val result = BookFinder.findByIsbn("9781783350438", FailingCache, testLookup)
    result.futureValue should be(Some(book))
  }

  it should "give some book, and update cache, for available book when cache is empty" in {
    val cache = emptyCache
    val result = BookFinder.findByIsbn("9781783350438", cache, testLookup)
    result.futureValue should be(Some(book))
    cache.get("9781783350438").futureValue should be(Some(bookJson))
  }

  it should "give none, and update cache, for unavailable book when cache is empty" in {
    val cache = emptyCache
    val result = BookFinder.findByIsbn("12345", cache, testLookup)
    result.futureValue should be(None)
    cache.get("12345").futureValue should be(Some(JsNull))
  }

  it should "give none, and not update cache, when lookup fails" in {
    val cache = emptyCache
    val result = BookFinder.findByIsbn("98765", cache, testLookup)
    result.futureValue should be(None)
    cache.get("98765").futureValue should be(None)
  }
}
