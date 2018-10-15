package services.dotcomponents.pickers
import model.PageWithStoryPackage
import play.api.mvc.RequestHeader
import services.dotcomponents.{RemoteRender, LocalRender, RenderType}

class WhitelistPicker extends RenderTierPickerStrategy {

  // no real need for this list be config, hardcoding is fine for now

  type Results = List[(String, Boolean)]

  val whitelist = List(
    "world/2018/oct/14/british-man-shot-dead-by-hunter-in-france",
    "politics/2018/oct/14/brexit-dominic-raab-rushes-to-brussels-before-eu-crunch-talks",
    "politics/2018/oct/14/eu-leaders-line-up-no-deal-emergency-brexit-summit-for-november",
    "world/2018/oct/01/palu-earthquake-and-tsunami-what-we-know-so-far",
    "info/2018/may/09/why-sign-in-to-the-guardian",
    "society/2018/oct/14/folic-acid-to-be-added-to-flour-in-effort-to-reduce-serious-birth-defects",
    "film/2017/dec/08/bryan-singer-denies-sexually-assaulting-17-year-old-boy-at-yacht-party-in-2003",
    "business/2018/oct/14/china-ambassador-cui-tiankai-stumped-on-who-aides-trump-on-trade",
    "world/2018/oct/14/bavaria-poll-humiliation-for-angela-merkel-conservative-allies",
    "world/2017/dec/31/at-least-10-tourists-and-two-pilots-killed-as-plane-crashes-in-costa-rica",
    "us-news/2017/nov/28/new-york-truck-attack-suspect-sayfullo-saipov",
    "australia-news/2018/oct/15/us-embassy-apologises-after-mistakenly-sending-cookie-monster-cat-invitation",
    "politics/2018/oct/15/foreign-office-left-disoriented-and-demoralised-by-brexit-say-diplomats",
    "film/2018/aug/03/harvey-weinstein-lawyers-new-york-court-sexual-assault-charges",
    "politics/2018/oct/14/local-welfare-schemes-in-england-on-brink-of-collapse-survey-finds",
    "society/2018/sep/01/children-social-care-services-councils-austerity",
    "uk-news/2018/oct/15/mi5-believed-black-people-posed-security-risk-papers-reveal",
    "info/2018/sep/07/removed-video",
    "world/2018/aug/24/more-than-25-children-and-four-women-killed-in-air-strikes-in-yemen",
    "help/2018/may/29/why-do-i-need-to-upgrade-my-browser",
    "world/2017/oct/23/syria-shocking-images-of-starving-baby-reveal-impact-of-food-crisis",
    "business/2018/oct/14/saudi-shares-drop-on-fallout-journalists-disappearance-trump",
    "commentisfree/2018/may/27/royal-wedding-celebration-black-excellence-letters",
    "uk-news/2018/sep/05/child-sexual-exploitation-18-people-appear-in-huddersfield-court",
    "us-news/2018/aug/18/colorado-bodies-crude-oil-murder-case",
    "business/2018/oct/14/uk-scientists-turn-coffee-waste-electricity-fuel-cell-colombia",
    "info/2018/sep/20/article-removed",
    "money/2018/oct/15/three-quarters-of-uk-workers-do-not-receive-same-pay-each-month",
    "info/2018/aug/10/article-removed",
    "help/2018/apr/18/subscriptions",
    "uk-news/2018/oct/14/met-police-damian-collins-no-investigation-leave-campaigners-data-misuse",
    "world/2018/oct/14/nine-climbers-killed-in-storm-in-himalayas-mount-gurja-nepal-south-korea",
    "help/2017/mar/15/computer-security-tips-for-whistleblowers-and-sources",
    "uk-news/2018/oct/15/cornwall-murder-lyn-bryant-police-new-dna-evidence"
  )

  override def getRenderTierFor(page: PageWithStoryPackage, request: RequestHeader): (Results, RenderType) = {

    if(whitelist.contains(page.metadata.id)){
      List() -> RemoteRender
    } else {
      List() -> LocalRender
    }

  }

}
