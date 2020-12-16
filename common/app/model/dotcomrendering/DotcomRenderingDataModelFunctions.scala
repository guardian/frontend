package model.dotcomrendering

import java.net.URLEncoder

import com.gu.contentapi.client.model.v1.ElementType.Text
import com.gu.contentapi.client.model.v1.{Block => APIBlock, BlockElement => ClientBlockElement, Blocks => APIBlocks}
import com.gu.contentapi.client.utils.{AdvertisementFeature, DesignType}
import common.Edition
import common.Maps.RichMap
import common.commercial.{EditionCommercialProperties}
import conf.Configuration.affiliateLinks
import conf.switches.Switches
import conf.{Configuration, Static}
import model.content.Atom
import model.dotcomrendering.pageElements.{TextCleaner, DisclaimerBlockElement, PageElement}
import model.{
  Article,
  ArticleDateTimes,
  Badges,
  CanonicalLiveBlog,
  DisplayedDateTimesDCR,
  GUDateTimeFormatNew,
  LiveBlogPage,
  PageWithStoryPackage,
  Pillar,
}
import navigation.ReaderRevenueSite.{Support, SupportContribute, SupportSubscribe}
import navigation.UrlHelpers._
import navigation.NavMenu
import navigation.FooterLinks
import play.api.libs.json._
import play.api.mvc.RequestHeader
import common.RichRequestHeader
import views.html.fragments.affiliateLinksDisclaimer
import views.support.{AffiliateLinksCleaner, CamelCase, ContentLayout, ImgSrc, Item300}
import model.ArticlePage
import experiments.ActiveExperiments
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import views.support.JavaScriptPage

// We have introduced our own set of objects for serializing data to the DotComponents API,
// because we don't want people changing the core frontend models and as a side effect,
// making them incompatible with Dotcomponents. By having our own set of models, there's
// only one reason for change.
// exceptions: we do resuse the existing Nav & BlockElement classes right now

object DotcomRenderingDataModelFunctions {

  private def makeMatchUrl(articlePage: PageWithStoryPackage): Option[String] = {

    def extraction1(references: JsValue): Option[IndexedSeq[JsValue]] = {
      val sequence = references match {
        case JsArray(elements) => Some(elements)
        case _                 => None
      }
      sequence
    }

    def entryToDataPair(entry: JsValue): Option[(String, String)] = {
      /*
          Examples:
          {
            "esa-football-team": "/\" + \"football/\" + \"team/\" + \"331"
          }
          {
            "pa-football-competition": "500"
          }
          {
            "pa-football-team": "26305"
          }
       */
      val obj = entry.as[JsObject]
      obj.fields.map(pair => (pair._1, pair._2.as[String])).headOption
    }

    val optionalUrl: Option[String] = for {
      references <- articlePage.getJavascriptConfig.get("references")
      entries1 <- extraction1(references)
      entries2 =
        entries1
          .map(entryToDataPair(_))
          .filter(_.isDefined)
          .map(_.get) // .get is fundamentally dangerous but fine in this case because we filtered the Nones out.
          .filter(_._1 == "pa-football-team")
    } yield {
      val pageId = URLEncoder.encode(articlePage.article.metadata.id, "UTF-8")
      entries2.toList match {
        case e1 :: e2 :: _ => {
          val year = articlePage.article.trail.webPublicationDate.toString(DateTimeFormat.forPattern("yyy"))
          val month = articlePage.article.trail.webPublicationDate.toString(DateTimeFormat.forPattern("MM"))
          val day = articlePage.article.trail.webPublicationDate.toString(DateTimeFormat.forPattern("dd"))
          s"${Configuration.ajax.url}/football/api/match-nav/${year}/${month}/${day}/${e1._2}/${e2._2}.json?dcr=true&page=${pageId}"
        }
        case _ => ""
      }
    }

    // We need one more transformation because we could have a Some(""), which we don't want

    if (optionalUrl.getOrElse("").size > 0) {
      optionalUrl
    } else {
      None
    }
  }

  private def designTypeAsString(designType: Option[DesignType]): String = {
    designType.map(_.toString).getOrElse("Article")
  }

  private def buildFullCommercialUrl(bundlePath: String): String = {
    // This function exists because for some reasons `Static` behaves differently in { PROD and CODE } versus LOCAL
    if (Configuration.environment.isProd || Configuration.environment.isCode) {
      Static(bundlePath)
    } else {
      s"${Configuration.site.host}${Static(bundlePath)}"
    }
  }

  // note: this is duplicated in the onward service (DotcomponentsOnwardsModels - if duplicating again consider moving to common! :()
  private def findPillar(pillar: Option[Pillar], designType: Option[DesignType]): String = {
    pillar
      .map { pillar =>
        if (designType == AdvertisementFeature) "labs"
        else if (pillar.toString.toLowerCase == "arts") "culture"
        else pillar.toString.toLowerCase()
      }
      .getOrElse("news")
  }

  private def blocksForLiveblogPage(liveblog: LiveBlogPage, blocks: APIBlocks): Seq[APIBlock] = {
    val last60 = blocks.requestedBodyBlocks
      .getOrElse(Map.empty[String, Seq[APIBlock]])
      .getOrElse(CanonicalLiveBlog.firstPage, Seq.empty[APIBlock])
      .toList

    // For the newest page, the last 60 blocks are requested, but for other page,
    // all of the blocks have been requested and returned in the blocks.body bit
    // of the response so we use those
    val relevantBlocks = if (last60.isEmpty) blocks.body.getOrElse(Nil) else last60

    val ids = liveblog.currentPage.currentPage.blocks.map(_.id).toSet
    relevantBlocks.filter(block => ids(block.id))
  }

  private def addDisclaimer(
      elems: List[PageElement],
      capiElems: Seq[ClientBlockElement],
      affiliateLinks: Boolean,
  ): List[PageElement] = {
    if (affiliateLinks) {
      val hasLinks = capiElems.exists(elem =>
        elem.`type` match {
          case Text => {
            val textString = elem.textTypeData.toList.mkString("\n") // just concat all the elems here for this test
            AffiliateLinksCleaner.stringContainsAffiliateableLinks(textString)
          }
          case _ => false
        },
      )

      if (hasLinks) {
        elems :+ DisclaimerBlockElement(affiliateLinksDisclaimer("article").body)
      } else {
        elems
      }
    } else elems
  }

  private def blockElementsToPageElements(
      capiElems: Seq[ClientBlockElement],
      request: RequestHeader,
      article: Article,
      affiliateLinks: Boolean,
      isMainBlock: Boolean,
      isImmersive: Boolean,
      campaigns: Option[JsValue],
      calloutsUrl: Option[String],
  ): List[PageElement] = {

    val atoms: Iterable[Atom] = article.content.atoms.map(_.all).getOrElse(Seq())
    val edition = Edition(request)

    val elems = capiElems.toList
      .flatMap(el =>
        PageElement.make(
          element = el,
          addAffiliateLinks = affiliateLinks,
          pageUrl = request.uri,
          atoms = atoms,
          isMainBlock,
          isImmersive,
          campaigns,
          calloutsUrl,
          article.elements.thumbnail,
          edition,
        ),
      )
      .filter(PageElement.isSupported)

    val withTagLinks = TextCleaner.tagLinks(elems, article.content.tags, article.content.showInRelated, edition)
    addDisclaimer(withTagLinks, capiElems, affiliateLinks)
  }

  private def toBlock(
      block: APIBlock,
      page: PageWithStoryPackage,
      shouldAddAffiliateLinks: Boolean,
      request: RequestHeader,
      isMainBlock: Boolean,
      isImmersive: Boolean,
      articleDateTimes: ArticleDateTimes,
      calloutsUrl: Option[String],
  ): Block = {

    val article = page.article

    // We are passing through the block data here, not the article
    // the block dateTime types are used for liveblogs
    // We will remove the non 'block' prefixed versions when DCR change is out
    val createdOn = block.createdDate.map(_.dateTime)
    val createdOnDisplay = createdOn.map(dt => GUDateTimeFormatNew.formatTimeForDisplay(new DateTime(dt), request))
    val blockCreatedOn = block.createdDate.map(_.dateTime)
    val blockCreatedOnDisplay = createdOn.map(dt => GUDateTimeFormatNew.formatTimeForDisplay(new DateTime(dt), request))

    val blockFirstPublished = block.firstPublishedDate.map(_.dateTime)
    val blockFirstPublishedDisplay =
      blockFirstPublished.map(dt => GUDateTimeFormatNew.formatTimeForDisplay(new DateTime(dt), request))

    val blockLastUpdated = block.lastModifiedDate.map(_.dateTime)
    val blockLastUpdatedDisplay =
      blockLastUpdated.map(dt => GUDateTimeFormatNew.formatTimeForDisplay(new DateTime(dt), request))

    // last updated (in both versions) and first published (in both versions) are going to
    // be computed from the article metadata.
    // For this we introduced ArticleDateTimes in DatesAndTimes.
    // This is meant to ensure that DCP and DCR use the same dates.
    val displayedDateTimes: DisplayedDateTimesDCR =
      ArticleDateTimes.makeDisplayedDateTimesDCR(articleDateTimes, request)
    val campaigns = page.getJavascriptConfig.get("campaigns")

    Block(
      id = block.id,
      elements = blockElementsToPageElements(
        block.elements,
        request,
        article,
        shouldAddAffiliateLinks,
        isMainBlock,
        isImmersive,
        campaigns,
        calloutsUrl,
      ),
      createdOn = createdOn,
      createdOnDisplay = createdOnDisplay,
      blockCreatedOn = blockCreatedOn,
      blockCreatedOnDisplay = blockCreatedOnDisplay,
      lastUpdated = Some(displayedDateTimes.lastUpdated),
      lastUpdatedDisplay = Some(displayedDateTimes.lastUpdatedDisplay),
      blockLastUpdated = blockLastUpdated,
      blockLastUpdatedDisplay = blockLastUpdatedDisplay,
      title = block.title,
      firstPublished = Some(displayedDateTimes.firstPublished),
      firstPublishedDisplay = Some(displayedDateTimes.firstPublishedDisplay),
      blockFirstPublished = blockFirstPublished,
      blockFirstPublishedDisplay = blockFirstPublishedDisplay,
      primaryDateLine = displayedDateTimes.primaryDateLine,
      secondaryDateLine = displayedDateTimes.secondaryDateLine,
    )
  }

  // -----------------------------------------------------------------------

  def fromArticle(
      page: PageWithStoryPackage,
      request: RequestHeader,
      blocks: APIBlocks,
      pageType: PageType,
  ): DotcomRenderingDataModel = {

    val article = page.article

    val switches = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      })

    val config = Config(
      switches = switches,
      abTests = ActiveExperiments.getJsMap(request),
      commercialBundleUrl = buildFullCommercialUrl("javascripts/graun.commercial.dcr.js"),
      ampIframeUrl = buildFullCommercialUrl("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val jsPageConfig = JavaScriptPage.getMap(page, Edition(request), false, request)
    val combinedConfig = Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
    val calloutsUrl = combinedConfig.fields.toList
      .filter(entry => entry._1 == "calloutsUrl")
      .headOption
      .flatMap(entry => entry._2.asOpt[String])

    // TODO this logic is duplicated from the cleaners, can we consolidate?
    val shouldAddAffiliateLinks = AffiliateLinksCleaner.shouldAddAffiliateLinks(
      switchedOn = Switches.AffiliateLinks.isSwitchedOn,
      section = article.metadata.sectionId,
      showAffiliateLinks = article.content.fields.showAffiliateLinks,
      supportedSections = affiliateLinks.affiliateLinkSections,
      defaultOffTags = affiliateLinks.defaultOffTags,
      alwaysOffTags = affiliateLinks.alwaysOffTags,
      tagPaths = article.content.tags.tags.map(_.id),
      firstPublishedDate = article.content.fields.firstPublicationDate,
    )

    val bodyBlocksRaw = page match {
      case lb: LiveBlogPage => blocksForLiveblogPage(lb, blocks)
      case article          => blocks.body.getOrElse(Nil)
    }

    val articleDateTimes = ArticleDateTimes(
      webPublicationDate = article.trail.webPublicationDate,
      firstPublicationDate = article.fields.firstPublicationDate,
      hasBeenModified = article.content.hasBeenModified,
      lastModificationDate = article.fields.lastModified,
    )

    val bodyBlocks = bodyBlocksRaw
      .filter(_.published || pageType.isPreview)
      .map(block =>
        toBlock(
          block,
          page,
          shouldAddAffiliateLinks,
          request,
          false,
          article.isImmersive,
          articleDateTimes,
          calloutsUrl,
        ),
      )
      .toList

    val pagination = page match {
      case liveblog: LiveBlogPage =>
        liveblog.currentPage.pagination.map(paginationInfo => {
          Pagination(
            currentPage = liveblog.currentPage.currentPage.pageNumber,
            totalPages = paginationInfo.numberOfPages,
            newest = paginationInfo.newest.map(_.suffix),
            newer = paginationInfo.newer.map(_.suffix),
            oldest = paginationInfo.oldest.map(_.suffix),
            older = paginationInfo.older.map(_.suffix),
          )
        })
      case _ => None
    }

    val mainBlock: Option[Block] = {
      blocks.main.map(block =>
        toBlock(block, page, shouldAddAffiliateLinks, request, true, article.isImmersive, articleDateTimes, calloutsUrl),
      )
    }

    val keyEvents: Seq[Block] = {
      blocks.requestedBodyBlocks
        .getOrElse(Map.empty[String, Seq[APIBlock]])
        .getOrElse("body:key-events", Seq.empty[APIBlock])
        .map(block =>
          toBlock(
            block,
            page,
            shouldAddAffiliateLinks,
            request,
            false,
            article.isImmersive,
            articleDateTimes,
            calloutsUrl,
          ),
        )
    }

    val jsConfig = (k: String) => page.getJavascriptConfig.get(k).map(_.as[String])

    // See https://developers.google.com/search/docs/data-types/article (and the AMP info too)
    // For example, we need to provide an image of at least 1200px width to be valid here
    val linkedData: List[LinkedData] = {
      page match {
        case liveblog: LiveBlogPage =>
          LinkedData.forLiveblog(
            liveblog = liveblog,
            blocks = bodyBlocksRaw,
            baseURL = Configuration.amp.baseUrl,
            fallbackLogo = Configuration.images.fallbackLogo,
          )
        case regular: ArticlePage =>
          LinkedData.forArticle(
            article = regular.article,
            baseURL = Configuration.amp.baseUrl,
            fallbackLogo = Configuration.images.fallbackLogo,
          )
      }
    }

    val openGraphData: Map[String, String] = page.getOpenGraphProperties;
    val twitterData: Map[String, String] = page.getTwitterProperties

    val allTags = article.tags.tags.map(t =>
      Tag(
        t.id,
        t.properties.tagType,
        t.properties.webTitle,
        t.properties.twitterHandle,
        t.properties.contributorLargeImagePath.map(src => ImgSrc(src, Item300)),
      ),
    )

    val headerReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
      getReaderRevenueUrl(SupportContribute, Header)(request),
      getReaderRevenueUrl(SupportSubscribe, Header)(request),
      getReaderRevenueUrl(Support, Header)(request),
    )

    val footerReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
      getReaderRevenueUrl(SupportContribute, Footer)(request),
      getReaderRevenueUrl(SupportSubscribe, Footer)(request),
      getReaderRevenueUrl(Support, Footer)(request),
    )

    val sideMenuReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
      getReaderRevenueUrl(SupportContribute, SideMenu)(request),
      getReaderRevenueUrl(SupportSubscribe, SideMenu)(request),
      getReaderRevenueUrl(Support, SideMenu)(request),
    )

    val ampHeaderReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
      getReaderRevenueUrl(SupportContribute, AmpHeader)(request),
      getReaderRevenueUrl(SupportSubscribe, AmpHeader)(request),
      getReaderRevenueUrl(Support, AmpHeader)(request),
    )

    val ampFooterReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
      getReaderRevenueUrl(SupportContribute, AmpFooter)(request),
      getReaderRevenueUrl(SupportSubscribe, AmpFooter)(request),
      getReaderRevenueUrl(Support, AmpFooter)(request),
    )

    val readerRevenueLinks = ReaderRevenueLinks(
      headerReaderRevenueLink,
      footerReaderRevenueLink,
      sideMenuReaderRevenueLink,
      ampHeaderReaderRevenueLink,
      ampFooterReaderRevenueLink,
    )

    val nav = {
      val navMenu = NavMenu(page, Edition(request))
      Nav(
        currentUrl = navMenu.currentUrl,
        pillars = navMenu.pillars,
        otherLinks = navMenu.otherLinks,
        brandExtensions = navMenu.brandExtensions,
        currentNavLink = navMenu.currentNavLink,
        currentParent = navMenu.currentParent,
        currentPillar = navMenu.currentPillar,
        subNavSections = navMenu.subNavSections,
        readerRevenueLinks = readerRevenueLinks,
      )
    }

    val commercial = Commercial(
      editionCommercialProperties = article.metadata.commercial
        .map { _.perEdition.mapKeys(_.id) }
        .getOrElse(Map.empty[String, EditionCommercialProperties]),
      prebidIndexSites = (for {
        commercial <- article.metadata.commercial
        sites <- commercial.prebidIndexSites
      } yield sites.toList).getOrElse(List()),
      article.metadata.commercial,
      pageType,
    )

    val byline = article.trail.byline

    val author = Author(
      byline = byline,
      twitterHandle = article.tags.contributors.headOption.flatMap(_.properties.twitterHandle),
    )

    val badge = Badges
      .badgeFor(article)
      .map(badge =>
        DCRBadge(
          badge.seriesTag,
          badge.imageUrl,
        ),
      )

    val pageFooter = PageFooter(
      FooterLinks.getFooterByEdition(Edition(request)),
    )

    val isPaidContent = article.metadata.designType.contains(AdvertisementFeature)
    val edition = Edition(request)

    DotcomRenderingDataModel(
      version = 3,
      headline = article.trail.headline,
      standfirst = TextCleaner.sanitiseLinks(edition)(article.fields.standfirst.getOrElse("")),
      webTitle = article.metadata.webTitle,
      mainMediaElements = mainBlock.toList.flatMap(_.elements),
      main = article.fields.main,
      keyEvents = keyEvents.toList,
      blocks = bodyBlocks,
      pagination = pagination,
      author = author,
      webPublicationDate = article.trail.webPublicationDate.toString, // TODO check format
      webPublicationDateDisplay =
        GUDateTimeFormatNew.formatDateTimeForDisplay(article.trail.webPublicationDate, request),
      editionLongForm = Edition(request).displayName, // TODO check
      editionId = edition.id,
      pageId = article.metadata.id,
      tags = allTags,
      pillar = findPillar(article.metadata.pillar, article.metadata.designType),
      isImmersive = article.isImmersive,
      sectionLabel = article.content.sectionLabelName,
      sectionUrl = article.content.sectionLabelLink,
      sectionName = article.metadata.section.map(_.value),
      subMetaSectionLinks = article.content.submetaLinks.sectionLabels.map(SubMetaLink.apply),
      subMetaKeywordLinks = article.content.submetaLinks.keywords.map(SubMetaLink.apply),
      shouldHideAds = article.content.shouldHideAdverts,
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      webURL = article.metadata.webUrl,
      linkedData = linkedData,
      openGraphData = openGraphData,
      twitterData = twitterData,
      config = combinedConfig,
      guardianBaseURL = Configuration.site.host,
      contentType = jsConfig("contentType").getOrElse(""),
      hasRelated = article.content.showInRelated,
      hasStoryPackage = page.related.hasStoryPackage,
      beaconURL = Configuration.debug.beaconUrl,
      isCommentable = article.trail.isCommentable,
      commercialProperties = commercial.editionCommercialProperties,
      pageType = pageType,
      starRating = article.content.starRating,
      trailText = TextCleaner.sanitiseLinks(edition)(article.trail.fields.trailText.getOrElse("")),
      nav = nav,
      showBottomSocialButtons = ContentLayout.showBottomSocialButtons(article),
      designType = designTypeAsString(article.metadata.designType),
      pageFooter = pageFooter,
      publication = article.content.publication,
      // See pageShouldHideReaderRevenue in contributions-utilities.js
      shouldHideReaderRevenue = article.fields.shouldHideReaderRevenue
        .getOrElse(isPaidContent),
      slotMachineFlags = request.slotMachineFlags,
      contributionsServiceUrl = Configuration.contributionsService.url,
      badge = badge,
      // Match Data
      matchUrl = makeMatchUrl(page),
    )
  }
}
