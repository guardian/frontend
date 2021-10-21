package services.dotcomrendering

object PressedInteractives {
  // Temporarily retain a list of pressed interactives that Visuals agree to show to readers
  // Ed Tools are supporting us in how to batch/programmatically add tags to pressed articles.
  // When we can tag pressed articles (tracking/dcroptout) then we will:
  // - tag all articles that appear in this list
  // - remove this file entirely
  // - update the InteractiveController to show pressed pages based on presence of the tag
  // - update the press+clean functionality to automate tagging as part of this process
  private[this] val interactives = Set[String](
    "/world/ng-interactive/2020/nov/12/beirut-blast-a-night-of-horror-captured-by-its-victims",
    "/environment/ng-interactive/2021/feb/23/beneath-the-blue-dive-into-a-dazzling-ocean-under-threat-interactive",
    "/global-development/ng-interactive/2021/jul/28/countdown-to-demolition-the-story-of-al-jalaa-tower-gaza-israel-palestine",
    "/environment/ng-interactive/2021/feb/19/how-fires-have-spread-to-previously-untouched-parts-of-the-world?dcr=true",
    "/us-news/ng-interactive/2020/nov/07/how-did-joe-biden-win-presidency-visual-guide?dcr=true",
    "/world/ng-interactive/2021/apr/21/how-vaccines-are-affecting-covid-19-outbreaks-globally?dcr=true",
    "/world/ng-interactive/2020/jun/25/revealed-data-shows-10-countries-risking-coronavirus-second-wave-as-lockdown-relaxed",
    "/world/ng-interactive/2021/mar/19/revealed-the-data-that-shows-how-covid-bounced-back-after-the-uks-lockdowns",
    "/world/ng-interactive/2021/jun/28/vaccine-inequality-how-rich-countries-cut-covid-deaths-as-poorer-fall-behind",
    "/world/ng-interactive/2021/jan/08/which-countries-have-reported-new-uk-covid-variant",
    "/politics/ng-interactive/2020/nov/25/why-are-fish-a-sticking-point-in-the-brexit-talks",
    "/world/ng-interactive/2020/dec/16/covid-chaos-a-timeline-of-the-uks-handling-of-the-coronavirus-crisis",
    "/us-news/ng-interactive/2020/mar/18/democratic-primary-delegate-count-latest",
    "/us-news/ng-interactive/2020/oct/30/electoral-college-explained-how-biden-faces-an-uphill-battle-in-the-us-election",
    "/us-news/ng-interactive/2020/oct/30/build-your-own-us-election-result-plot-a-win-for-biden-or-trump",
    "/society/ng-interactive/2020/apr/29/how-humans-have-reacted-to-pandemics-through-history-a-visual-guide",
    "/cities/ng-interactive/2020/sep/25/garden-streets-bike-superhighways-cities-future-coronavirus",
    "/world/ng-interactive/2021/jan/25/how-the-arab-spring-unfolded-a-visualisation",
    "/uk-news/ng-interactive/2020/jun/10/mark-duggan-shooting-can-forensic-tech-cast-doubt-on-official-report",
    "/global-development/ng-interactive/2020/jan/15/environment-inequality-hunger-which-global-problems-would-you-fix-first",
    "/environment/ng-interactive/2019/oct/11/guardian-climate-score-how-did-your-mp-do",
    "/environment/ng-interactive/2019/oct/09/half-century-dither-denial-climate-crisis-timeline",
    "/politics/ng-interactive/2019/jul/15/gaffe-prone-arch-schemer-real-boris-johnson-quiz",
    "/environment/ng-interactive/2019/may/17/air-pollution-may-be-damaging-every-organ-and-cell-in-the-body-finds-global-review",
    "/uk-news/ng-interactive/2019/may/06/london-v-england-where-does-your-area-fit-in-the-great-divide",
    "/environment/ng-interactive/2018/dec/21/deadly-weather-the-human-cost-of-2018s-climate-disasters-visual-guide",
    "/us-news/ng-interactive/2018/jul/31/california-fires-wildfires-2018-visual-guide-map",
    "/politics/ng-interactive/2019/feb/15/how-brexit-revealed-four-new-political-factions",
    "/politics/ng-interactive/2018/nov/15/can-you-get-mays-brexit-deal-through-parliament",
    "/world/ng-interactive/2019/may/02/leavers-v-remainers-how-britains-tribes-compare",
    "/politics/ng-interactive/2019/sep/02/a-typical-hour-in-the-life-of-the-irish-border",
    "/politics/ng-interactive/2017/jul/20/where-are-we-up-to-in-these-brexit-talks",
    "/politics/ng-interactive/2016/jun/03/brexit-how-can-the-same-statistics-be-read-so-differently",
    "/politics/ng-interactive/2019/aug/13/how-a-no-deal-brexit-threatens-your-weekly-food-shop",
    "/world/ng-interactive/2020/jun/29/not-fit-for-a-human-coronavirus-in-coxs-bazar-refugee-camps",
    "/world/ng-interactive/2015/aug/26/china-economic-slowdown-world-imports",
    "/world/ng-interactive/2019/may/26/eu-election-results-2019-across-europe",
    "/politics/2016/may/06/holyrood-elections-see-rise-of-team-ruth-and-demise-of-labour-vision",
    "/politics/ng-interactive/2019/dec/13/boris-johnson-achieves-landslide-victory-visual-guide",
    "/us-news/ng-interactive/2018/nov/07/blue-wave-or-blue-ripple-a-visual-guide-to-the-democrats-gains",
    "/cities/ng-interactive/2017/nov/03/three-degree-world-cities-drowned-global-warming",
    "/environment/ng-interactive/2019/may/25/the-power-switch-tracking-britains-record-coal-free-run",
    "/society/ng-interactive/2015/feb/05/-sp-watch-how-measles-outbreak-spreads-when-kids-get-vaccinated",
    "/world/ng-interactive/2018/jul/03/thailand-cave-rescue-where-were-the-boys-found-and-how-can-they-be-rescued",
    "/world/ng-interactive/2019/mar/06/revealed-the-rise-and-rise-of-populist-rhetoric",
    "/world/ng-interactive/2017/jan/17/missing-flight-mh370-a-visual-guide-to-the-parts-and-debris-found-so-far",
    "/society/ng-interactive/2015/sep/02/unaffordable-country-where-can-you-afford-to-buy-a-house",
    "/world/interactive/2012/may/08/gay-rights-united-states",
    "/technology/ng-interactive/2018/apr/24/bezoss-empire-how-amazon-became-the-worlds-biggest-retailer",
    "/technology/2016/apr/12/the-dark-side-of-guardian-comments",
    "/environment/ng-interactive/2020/may/20/relax-to-the-sounds-of-british-wildlife",
  )

  def isPressed(path: String): Boolean = interactives.contains(path)
}
