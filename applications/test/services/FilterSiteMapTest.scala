package services

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.{
  AssetFields,
  AssetType,
  Content => CapiContent,
  ContentFields,
  ElementType,
  SearchResponse,
}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import contentapi.FixtureTemplates.{emptyApiContent, emptyAsset, emptyElement, emptyTag}
import contentapi.ContentApiClient
import java.time.OffsetDateTime
import implicits.Dates.CapiRichDateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.mockito.ArgumentMatchers.{any, argThat}
import org.mockito.Mockito.{verify, verifyNoInteractions, when}
import org.scalatestplus.mockito.MockitoSugar
import services.FilterSiteMap.{Uk, Us}
import test.WithTestExecutionContext

import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import scala.xml.XML

class FilterSiteMapTest extends AnyFlatSpec with Matchers with MockitoSugar with WithTestExecutionContext {

  private val publicationDate = OffsetDateTime.parse("2026-10-20T08:00:00Z").toCapiDateTime
  private val modifiedDate = OffsetDateTime.parse("2026-10-24T09:15:00Z").toCapiDateTime

  private def article(id: String, region: FilterSiteMap.Region = Uk): CapiContent = emptyApiContent.copy(
    id = id,
    webUrl = s"https://www.theguardian.com/$id",
    webPublicationDate = Some(publicationDate),
    tags = Seq(emptyTag.copy(id = region.tagIds.head)),
  )

  private def response(contents: Seq[CapiContent], pages: Int = 1): SearchResponse = {
    val result = mock[SearchResponse]
    when(result.results).thenReturn(contents)
    when(result.pages).thenReturn(pages)
    result
  }

  private def client(): ContentApiClient = {
    val result = mock[ContentApiClient]
    when(result.search()).thenReturn(com.gu.contentapi.client.ContentApiClient.search)
    result
  }

  private def query: SearchQuery =
    com.gu.contentapi.client.ContentApiClient.search
      .pageSize(200)
      .orderBy("newest")
      .showFields("headline,lastModified")
      .showTags("all")
      .showElements("image")

  private def matchingQuery(expected: SearchQuery): SearchQuery =
    argThat[SearchQuery](actual => actual.toString == expected.toString)

  "FilterSiteMap.buildSitemaps" should "produce escaped canonical URLs and UTC dates in separate regional XML" in {
    val uk = article("thefilter/example").copy(
      webUrl = "https://www.theguardian.com/thefilter/example?a=1&b=2",
      webPublicationDate = Some(OffsetDateTime.parse("2026-10-20T10:00:00+02:00").toCapiDateTime),
    )
    val us = article("thefilter-us/example", Us).copy(
      webPublicationDate = None,
      fields = Some(ContentFields(lastModified = Some(modifiedDate))),
    )
    val sitemaps = FilterSiteMap.buildSitemaps(Seq(uk, us, uk))
    val ukXml = XML.loadString(sitemaps(Uk).toString)
    val usXml = XML.loadString(sitemaps(Us).toString)

    ukXml.namespace should be("http://www.sitemaps.org/schemas/sitemap/0.9")
    (ukXml \ "url").size should be(1)
    (ukXml \ "url" \ "loc").text should be(uk.webUrl)
    sitemaps(Uk).toString should include("&amp;")
    (ukXml \ "url" \ "lastmod").text should be("2026-10-20T08:00:00Z")
    (usXml \ "url" \ "loc").text should be(us.webUrl)
    (usXml \ "url" \ "lastmod").text should be("2026-10-24T09:15:00Z")
    (ukXml \ "url" \ "changefreq") should be(empty)
    (ukXml \ "url" \ "priority") should be(empty)
  }

  it should "include the main picture as an image entry and omit it when there is none" in {
    val mainPicture = emptyElement.copy(
      id = "main-picture",
      relation = "main",
      `type` = ElementType.Image,
      assets = List(
        emptyAsset.copy(
          `type` = AssetType.Image,
          mimeType = Some("image/jpeg"),
          file = Some("https://media.guim.co.uk/example/master/1200.jpg"),
          typeData = Some(AssetFields(width = Some(1200), height = Some(720))),
        ),
      ),
    )
    val withImage = article("thefilter/with-image").copy(elements = Some(List(mainPicture)))
    val withoutImage = article("thefilter/without-image")
    val sitemap = FilterSiteMap.buildSitemaps(Seq(withImage, withoutImage))(Uk)
    val imageNamespace = "http://www.google.com/schemas/sitemap-image/1.1"
    val entries = (XML.loadString(sitemap.toString) \ "url").map(url => (url \ "loc").text -> url).toMap

    val image = entries(withImage.webUrl) \ "image"
    image.map(_.namespace) should be(Seq(imageNamespace))
    (image \ "loc").text should not be empty
    (entries(withoutImage.webUrl) \ "image") should be(empty)
  }

  it should "drop invalid locations and articles with missing or unrelated Filter tags from both regions" in {
    val invalid =
      Seq("", "not a URL", "https://example.com/article", "http://www.theguardian.com/article").zipWithIndex.map {
        case (url, index) => article(s"invalid-$index").copy(webUrl = url)
      }
    val sitemaps = FilterSiteMap.buildSitemaps(
      invalid ++ Seq(
        article("valid"),
        article("untagged").copy(tags = Nil),
        article("unrelated").copy(tags = Seq(emptyTag.copy(id = "lifeandstyle/lifeandstyle"))),
      ),
    )

    (sitemaps(Uk) \ "url" \ "loc").map(_.text) should be(Seq(article("valid").webUrl))
    (sitemaps(Us) \ "url") should be(empty)
  }

  it should "accept 50000 URLs but fail rather than truncate 50001" in {
    val contents = (1 to 50000).map(index => article(s"thefilter/$index"))
    (FilterSiteMap.buildSitemaps(contents)(Uk) \ "url").size should be(50000)
    intercept[IllegalArgumentException] {
      FilterSiteMap.buildSitemaps(contents :+ article("thefilter/50001"))
    }.getMessage should include("50000 URLs")
  }

  it should "reject XML above the uncompressed 50 MB limit" in {
    val oversized = article("oversized").copy(webUrl = s"https://www.theguardian.com/${"a" * (50 * 1024 * 1024)}")
    intercept[IllegalArgumentException](FilterSiteMap.buildSitemaps(Seq(oversized))).getMessage should include("50 MB")
  }

  "FilterSiteMap.buildLatestSitemaps" should "fetch every manual page without an automatic query when disabled" in {
    val capi = client()
    val firstPage = response(Seq(article("first")), pages = 2)
    val secondPage = response(Seq(article("second")))
    when(capi.getResponse(any[SearchQuery])).thenReturn(
      Future.successful(firstPage),
      Future.successful(secondPage),
    )
    val sitemap = Await
      .result(
        new FilterSiteMap(capi).buildLatestSitemaps(FilterSiteMap.Settings(Seq("first", "second"), None)),
        5.seconds,
      )
      .get
    (sitemap(Uk) \ "url" \ "loc").map(_.text) should be(Seq(article("first").webUrl, article("second").webUrl))
    verify(capi, org.mockito.Mockito.times(2)).getResponse(any[SearchQuery])
    verify(capi).getResponse(matchingQuery(query.ids("first,second")))
    verify(capi).getResponse(matchingQuery(query.ids("first,second").page(2)))
  }

  it should "union manual articles with automatic articles at or after the exact cutoff without duplicates" in {
    val capi = client()
    val cutoff = OffsetDateTime.parse("2026-10-20T08:00:00Z")
    val manual = article("manual").copy(webPublicationDate = Some(cutoff.minusDays(1).toCapiDateTime))
    val boundary = article("boundary")
    val later = article("later", Us).copy(webPublicationDate = Some(cutoff.plusSeconds(1).toCapiDateTime))
    val earlier = article("earlier").copy(webPublicationDate = Some(cutoff.minusSeconds(1).toCapiDateTime))
    val manualResponse = response(Seq(manual))
    val automaticResponse =
      response(Seq(manual, boundary, later, earlier, article("undated").copy(webPublicationDate = None)))
    when(capi.getResponse(any[SearchQuery])).thenReturn(
      Future.successful(manualResponse),
      Future.successful(automaticResponse),
    )
    val sitemap = Await
      .result(
        new FilterSiteMap(capi).buildLatestSitemaps(FilterSiteMap.Settings(Seq("manual"), Some(cutoff))),
        5.seconds,
      )
      .get
    (sitemap(Uk) \ "url" \ "loc").map(_.text) should be(Seq(manual.webUrl, boundary.webUrl))
    (sitemap(Us) \ "url" \ "loc").map(_.text) should be(Seq(later.webUrl))
    verify(capi).getResponse(matchingQuery(query.ids("manual")))
    verify(capi).getResponse(
      matchingQuery(
        query
          .tag(
            "(thefilter/series/the-filter|tracking/commissioningdesk/the-filter|thefilter-us/series/thefilter-us|tracking/commissioningdesk/filter-us),-tone/advertisement-features",
          )
          .fromDate(cutoff.toInstant),
      ),
    )
  }

  it should "allow automatic-only population" in {
    val capi = client()
    val automaticResponse = response(Seq(article("automatic")))
    when(capi.getResponse(any[SearchQuery])).thenReturn(Future.successful(automaticResponse))
    val sitemap = Await
      .result(
        new FilterSiteMap(capi).buildLatestSitemaps(
          FilterSiteMap.Settings(Nil, Some(OffsetDateTime.parse("2026-10-20T08:00:00Z"))),
        ),
        5.seconds,
      )
      .get

    (sitemap(Uk) \ "url" \ "loc").text should be(article("automatic").webUrl)
    verify(capi).getResponse(any[SearchQuery])
  }

  it should "skip unconfigured sources without calling CAPI or publishing an empty sitemap" in {
    val capi = mock[ContentApiClient]
    Await.result(
      new FilterSiteMap(capi).buildLatestSitemaps(FilterSiteMap.Settings(Nil, None)),
      5.seconds,
    ) should be(None)
    verifyNoInteractions(capi)
  }

  it should "fail the build if any page fails" in {
    val capi = client()
    val failure = new RuntimeException("CAPI unavailable")
    val firstPage = response(Seq(article("first")), pages = 2)
    when(capi.getResponse(any[SearchQuery])).thenReturn(
      Future.successful(firstPage),
      Future.failed(failure),
    )
    intercept[RuntimeException] {
      Await.result(new FilterSiteMap(capi).buildLatestSitemaps(FilterSiteMap.Settings(Seq("first"), None)), 5.seconds)
    } should be(failure)
  }

  "FilterSiteMap.lastmod" should "prefer webPublicationDate even when lastModified is later" in {
    val content = emptyApiContent.copy(
      webPublicationDate = Some(publicationDate),
      fields = Some(ContentFields(lastModified = Some(modifiedDate))),
    )

    FilterSiteMap.lastmod(content) should be(Some(publicationDate.toJoda))
  }

  it should "use webPublicationDate when fields are absent" in {
    val content = emptyApiContent.copy(webPublicationDate = Some(publicationDate), fields = None)

    FilterSiteMap.lastmod(content) should be(Some(publicationDate.toJoda))
  }

  it should "fall back to fields.lastModified when webPublicationDate is absent" in {
    val content = emptyApiContent.copy(
      webPublicationDate = None,
      fields = Some(ContentFields(lastModified = Some(modifiedDate))),
    )

    FilterSiteMap.lastmod(content) should be(Some(modifiedDate.toJoda))
  }

  it should "drop undated entries without blocking either region" in {
    val undated = Seq(None, Some(ContentFields())).zipWithIndex.map { case (fields, index) =>
      article(s"undated-$index").copy(webPublicationDate = None, fields = fields)
    }
    undated.foreach(content => FilterSiteMap.lastmod(content) should be(None))

    val uk = article("dated-uk")
    val us = article("dated-us", Us)
    val sitemaps = FilterSiteMap.buildSitemaps(undated ++ Seq(uk, us))

    (sitemaps(Uk) \ "url" \ "loc").map(_.text) should be(Seq(uk.webUrl))
    (sitemaps(Us) \ "url" \ "loc").map(_.text) should be(Seq(us.webUrl))
  }

  "FilterSiteMap.regionOf" should "assign UK Filter content to the UK sitemap" in {
    FilterSiteMap.regionOf(Seq("lifeandstyle/lifeandstyle", "thefilter/series/the-filter")) should be(Some(Uk))
    FilterSiteMap.regionOf(Seq("tracking/commissioningdesk/the-filter")) should be(Some(Uk))
  }

  it should "assign US Filter content to the US sitemap" in {
    FilterSiteMap.regionOf(Seq("thefilter-us/series/thefilter-us", "type/article")) should be(Some(Us))
    FilterSiteMap.regionOf(Seq("tracking/commissioningdesk/filter-us")) should be(Some(Us))
  }

  it should "use the first Filter tag when content is tagged for both regions" in {
    FilterSiteMap.regionOf(
      Seq("thefilter-us/series/thefilter-us", "lifeandstyle/valentines-day", "thefilter/series/the-filter"),
    ) should be(Some(Us))
    FilterSiteMap.regionOf(
      Seq("tracking/commissioningdesk/the-filter", "thefilter-us/series/thefilter-us"),
    ) should be(Some(Uk))
  }

  it should "not assign content without a Filter tag" in {
    FilterSiteMap.regionOf(Seq("lifeandstyle/lifeandstyle", "type/article")) should be(None)
    FilterSiteMap.regionOf(Nil) should be(None)
  }
}
