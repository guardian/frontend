package model.dotcomrendering

import com.gu.commercial.branding.{Branding, Dimensions, Logo, Sponsored}
import common.Edition
import common.commercial.EditionCommercialProperties
import play.api.libs.functional.syntax._
import play.api.libs.json._

case class PuzzleItem(
    id: String,
    title: String,
    `type`: String,
    set: String,
    cardVariant: String,
    cadence: Option[String] = None,
    url: Option[String] = None,
    image: Option[String] = None,
    slug: Option[String] = None,
    index: Option[Int] = None,
    variant: Option[String] = None,
    backgroundColour: Option[String] = None,
    imageAlt: Option[String] = None,
    setter: Option[String] = None,
    date: Option[String] = None,
)

object PuzzleItem {
  val SupportedCardVariants: Set[String] = Set("large", "primary", "compact", "archive")

  private val reads: Reads[PuzzleItem] = Json
    .reads[PuzzleItem]
    .filter(JsonValidationError("puzzle id must be a lowercase kebab-case identifier"))(
      _.id.matches("[a-z0-9]+(?:-[a-z0-9]+)*"),
    )
    .filter(JsonValidationError(s"cardVariant must be one of ${SupportedCardVariants.toSeq.sorted.mkString(", ")}"))(
      item => SupportedCardVariants.contains(item.cardVariant),
    )
  private val writes: OWrites[PuzzleItem] = Json.writes[PuzzleItem].transform(removeNullFields)
  implicit val format: OFormat[PuzzleItem] = OFormat(reads, writes)

  private def removeNullFields(json: JsObject): JsObject =
    JsObject(json.fields.filterNot(_._2 == JsNull))
}

case class PuzzleContent(
    items: Seq[Seq[PuzzleItem]],
    nestedContainers: Seq[PuzzleContainer],
    archive: Option[PuzzleItem] = None,
    archiveChoices: Option[Seq[PuzzleItem]] = None,
)

object PuzzleContent {
  implicit lazy val format: OFormat[PuzzleContent] = (
    (__ \ "items").format[Seq[Seq[PuzzleItem]]] and
      (__ \ "nestedContainers").lazyFormat[Seq[PuzzleContainer]](Format.of[Seq[PuzzleContainer]]) and
      (__ \ "archive").formatNullable[PuzzleItem] and
      (__ \ "archiveChoices").formatNullable[Seq[PuzzleItem]]
  )(PuzzleContent.apply, unlift(PuzzleContent.unapply))
}

case class PuzzleContainer(
    id: String,
    title: String,
    variant: Option[String] = None,
    content: PuzzleContent,
    enabled: Option[Boolean] = None,
    desktopSpan: Option[Int] = None,
    adSlot: Option[String] = None,
    supporting: Option[PuzzlesSupportingContent] = None,
    sponsorship: Map[String, PuzzleSponsor] = Map.empty,
)

object PuzzleContainer {
  val SupportedVariants: Set[String] = Set("featured", "standard", "ad", "supporting")

  private lazy val reads: Reads[PuzzleContainer] = (
    (__ \ "id").read[String] and
      (__ \ "title").read[String] and
      (__ \ "variant").readNullable[String] and
      (__ \ "content").lazyRead[PuzzleContent](PuzzleContent.format) and
      (__ \ "enabled").readNullable[Boolean] and
      (__ \ "desktopSpan").readNullable[Int] and
      (__ \ "adSlot").readNullable[String] and
      (__ \ "supporting").readNullable[PuzzlesSupportingContent] and
      (__ \ "sponsorship").readNullable[Map[String, PuzzleSponsor]].map(_.getOrElse(Map.empty))
  )(PuzzleContainer.apply _).filter(JsonValidationError("container variant, span or ad slot is unsupported"))(
    container =>
      container.id.matches("[a-z0-9]+(?:-[a-z0-9]+)*") &&
        container.variant.forall(SupportedVariants.contains) &&
        container.desktopSpan.forall(span => span >= 1 && span <= 12) &&
        container.adSlot.forall(slot => slot.matches("inline[1-9][0-9]*") || slot == "mostpop"),
  )

  private lazy val writes: OWrites[PuzzleContainer] = (
    (__ \ "id").write[String] and
      (__ \ "title").write[String] and
      (__ \ "variant").writeNullable[String] and
      (__ \ "content").lazyWrite[PuzzleContent](PuzzleContent.format) and
      (__ \ "enabled").writeNullable[Boolean] and
      (__ \ "desktopSpan").writeNullable[Int] and
      (__ \ "adSlot").writeNullable[String] and
      (__ \ "supporting").writeNullable[PuzzlesSupportingContent] and
      (__ \ "commercialProperties").writeNullable[Map[String, EditionCommercialProperties]]
  )(container =>
    (
      container.id,
      container.title,
      container.variant,
      container.content,
      container.enabled,
      container.desktopSpan,
      container.adSlot,
      container.supporting,
      Option.when(container.sponsorship.nonEmpty)(PuzzleSponsor.commercialProperties(container.sponsorship)),
    ),
  )

  implicit lazy val format: OFormat[PuzzleContainer] = OFormat(reads, writes)
}

case class PuzzleLink(
    title: String,
    url: String,
)

object PuzzleLink {
  implicit val format: OFormat[PuzzleLink] = Json.format[PuzzleLink]
}

case class PuzzlesNewsletter(
    identityName: String,
    name: String,
    frequency: String,
    description: String,
    illustrationSquare: Option[String] = None,
    exampleUrl: Option[String] = None,
)

object PuzzlesNewsletter {
  private val writes: OWrites[PuzzlesNewsletter] = Json.writes[PuzzlesNewsletter].transform(removeNullFields)
  implicit val format: OFormat[PuzzlesNewsletter] = OFormat(Json.reads[PuzzlesNewsletter], writes)

  private def removeNullFields(json: JsObject): JsObject =
    JsObject(json.fields.filterNot(_._2 == JsNull))
}

case class PuzzlePopularityGroup(
    title: String,
    itemIds: Seq[String],
)

object PuzzlePopularityGroup {
  implicit val format: OFormat[PuzzlePopularityGroup] = Json.format[PuzzlePopularityGroup]
}

case class PuzzlesSupportingContent(
    usefulLinksTitle: String,
    usefulLinks: Seq[PuzzleLink],
    newsletter: Option[PuzzlesNewsletter],
    popularTitle: String,
    popularGroups: Seq[PuzzlePopularityGroup],
    // Set in puzzles-layout.json; resolved into `newsletter` from the newsletters API at request time.
    newsletterIdentityName: Option[String] = None,
)

object PuzzlesSupportingContent {
  implicit val format: OFormat[PuzzlesSupportingContent] = Json.format[PuzzlesSupportingContent]
}

/** Useful links and newsletter shown above the footer on individual game pages. */
case class PuzzleGameSupporting(
    usefulLinks: Seq[PuzzleLink],
    newsletter: Option[PuzzlesNewsletter],
)

object PuzzleGameSupporting {
  implicit val writes: OWrites[PuzzleGameSupporting] = Json.writes[PuzzleGameSupporting]
}

case class PuzzleSponsorLogo(src: String, darkSrc: Option[String], aspectRatio: Double)

object PuzzleSponsorLogo {
  implicit val reads: Reads[PuzzleSponsorLogo] = Json.reads[PuzzleSponsorLogo]
}

case class PuzzleSponsor(
    name: String,
    label: String,
    sponsorUri: String,
    aboutUri: Option[String],
    logo: PuzzleSponsorLogo,
) {
  def toBranding: Branding = {
    // DCR needs dimensions to reserve space; only the aspect ratio matters.
    val dimensions = Some(Dimensions(width = math.round(logo.aspectRatio * 100).toInt, height = 100))
    def brandingLogo(src: String) = Logo(src, dimensions, sponsorUri, label)
    Branding(
      brandingType = Sponsored,
      sponsorName = name,
      logo = brandingLogo(logo.src),
      logoForDarkBackground = logo.darkSrc.map(brandingLogo),
      aboutThisLink = aboutUri.getOrElse(""),
      hostedCampaignColour = None,
    )
  }
}

object PuzzleSponsor {
  implicit val reads: Reads[PuzzleSponsor] = Json.reads[PuzzleSponsor]

  def commercialProperties(sponsorship: Map[String, PuzzleSponsor]): Map[String, EditionCommercialProperties] =
    sponsorship.map { case (editionId, sponsor) =>
      editionId -> EditionCommercialProperties(Some(sponsor.toBranding), Set.empty)
    }
}

/** @param sponsorship hub sponsor per edition ID; sent to DCR as `commercialProperties`, not in the layout. */
case class PuzzlesLayout(containers: Seq[PuzzleContainer], sponsorship: Map[String, PuzzleSponsor] = Map.empty) {
  def commercialProperties: Map[String, EditionCommercialProperties] =
    PuzzleSponsor.commercialProperties(sponsorship)
}

object PuzzlesLayout {
  private val rawReads: Reads[PuzzlesLayout] = (
    (__ \ "containers").read[Seq[PuzzleContainer]] and
      (__ \ "sponsorship").readNullable[Map[String, PuzzleSponsor]].map(_.getOrElse(Map.empty))
  )(PuzzlesLayout.apply _)

  private val writes: OWrites[PuzzlesLayout] = OWrites(layout => Json.obj("containers" -> layout.containers))

  private val reads: Reads[PuzzlesLayout] = rawReads.flatMap { layout =>
    Reads { _ =>
      validationErrors(layout) match {
        case Seq()  => JsSuccess(layout)
        case errors => JsError(errors.map(error => JsPath -> Seq(JsonValidationError(error))))
      }
    }
  }

  implicit lazy val format: OFormat[PuzzlesLayout] = OFormat(reads, writes)

  def validationErrors(layout: PuzzlesLayout): Seq[String] = {
    val containers = flattenContainers(layout.containers)
    val items = containers.flatMap(container =>
      container.content.items.flatten ++ container.content.archive.toSeq ++ container.content.archiveChoices.toSeq.flatten,
    )
    val containerIds = containers.map(_.id)
    val itemIds = items.map(_.id)
    val topLevelIds = layout.containers.map(_.id).toSet
    val supportingItemIds = containers.flatMap(_.supporting.toSeq.flatMap(_.popularGroups.flatMap(_.itemIds)))

    duplicateValues("container", containerIds) ++
      sponsorshipErrors(layout.sponsorship) ++
      containers.flatMap(container => sponsorshipErrors(container.sponsorship)) ++
      containers.collect {
        case container
            if container.sponsorship.nonEmpty &&
              (!topLevelIds.contains(container.id) || container.variant.exists(Set("ad", "supporting"))) =>
          s"container '${container.id}' sponsorship is only supported on top-level featured or standard containers"
      } ++
      duplicateValues("puzzle", itemIds) ++
      supportingItemIds.filterNot(itemIds.contains).distinct.map(id => s"popular puzzle '$id' is not defined") ++
      containers.collect {
        case container
            if container.variant.contains("ad") &&
              (container.adSlot.forall(!_.matches("inline[1-9][0-9]*")) || container.title.nonEmpty ||
                container.content.nestedContainers.nonEmpty || container.content.archive.nonEmpty ||
                container.content.items.flatten.nonEmpty || container.content.archiveChoices.exists(_.nonEmpty) ||
                container.supporting.nonEmpty) =>
          s"ad container '${container.id}' must have an adSlot and no title or puzzle content"
        case container if container.variant.contains("supporting") && container.adSlot.exists(_ != "mostpop") =>
          s"supporting container '${container.id}' has an unsupported adSlot"
        case container
            if !container.variant
              .contains("ad") && !container.variant.contains("supporting") && container.adSlot.nonEmpty =>
          s"container '${container.id}' has an adSlot without an ad variant"
        case container if container.variant.contains("ad") && !topLevelIds.contains(container.id) =>
          s"ad container '${container.id}' must be top-level"
        case container if container.variant.contains("supporting") && !topLevelIds.contains(container.id) =>
          s"supporting container '${container.id}' must be top-level"
        case container
            if !container.variant
              .contains("ad") && !container.variant.contains("supporting") && container.title.trim.isEmpty =>
          s"container '${container.id}' must have a title"
        case container
            if container.variant.contains("supporting") &&
              (container.supporting.isEmpty || container.title.nonEmpty || container.content.items.flatten.nonEmpty ||
                container.content.nestedContainers.nonEmpty || container.content.archive.nonEmpty ||
                container.content.archiveChoices.exists(_.nonEmpty)) =>
          s"supporting container '${container.id}' must have supporting content and no title or puzzle content"
        case container if !container.variant.contains("supporting") && container.supporting.nonEmpty =>
          s"container '${container.id}' has supporting content without the supporting variant"
        case container if !container.variant.contains("featured") && container.enabled.nonEmpty =>
          s"container '${container.id}' has enabled without the featured variant"
      } ++
      containers.flatMap(_.supporting).flatMap { supporting =>
        val invalidLinks = supporting.usefulLinks.filter(link =>
          link.title.trim.isEmpty || !(link.url.startsWith("/puzzles-and-games") || link.url.matches("https?://.+")),
        )
        val invalidGroups = supporting.popularGroups.filter(group => group.title.trim.isEmpty || group.itemIds.isEmpty)
        val invalidNewsletter = supporting.newsletter.exists(newsletter =>
          newsletter.identityName.trim.isEmpty || newsletter.name.trim.isEmpty || newsletter.frequency.trim.isEmpty ||
            newsletter.description.trim.isEmpty,
        ) || supporting.newsletterIdentityName.exists(_.trim.isEmpty)

        invalidLinks.map(link => s"supporting link '${link.title}' has an invalid title or URL") ++
          invalidGroups.map(group => s"popular group '${group.title}' must have a title and puzzle IDs") ++
          Option.when(
            supporting.usefulLinksTitle.trim.isEmpty || supporting.popularTitle.trim.isEmpty || invalidNewsletter,
          )("supporting content has incomplete headings or newsletter metadata")
      } ++
      containers.collect {
        case container if container.content.archive.nonEmpty && container.content.archiveChoices.exists(_.nonEmpty) =>
          s"container '${container.id}' cannot define both archive and archiveChoices"
        case container if container.content.archiveChoices.exists(_.isEmpty) =>
          s"container '${container.id}' archiveChoices must contain at least one destination"
      } ++
      items.collect {
        case item
            if item.cardVariant == "archive" && !containers.exists(container =>
              container.content.archive.contains(item) || container.content.archiveChoices.exists(_.contains(item)),
            ) =>
          s"puzzle '${item.id}' uses archive presentation outside an archive slot"
        case item
            if item.cardVariant != "archive" && containers.exists(container =>
              container.content.archive.contains(item) || container.content.archiveChoices.exists(_.contains(item)),
            ) =>
          s"archive '${item.id}' must use the archive cardVariant"
      }
  }

  private def flattenContainers(containers: Seq[PuzzleContainer]): Seq[PuzzleContainer] =
    containers ++ containers.flatMap(container => flattenContainers(container.content.nestedContainers))

  private def sponsorshipErrors(sponsorship: Map[String, PuzzleSponsor]): Seq[String] = {
    val editionIds = Edition.allEditions.map(_.id).toSet
    def isUrl(value: String) = value.matches("https://.+")
    sponsorship.toSeq.sortBy(_._1).flatMap { case (editionId, sponsor) =>
      Option.when(!editionIds.contains(editionId))(s"sponsorship edition '$editionId' is not a known edition") ++
        Option.when(
          sponsor.name.trim.isEmpty || sponsor.label.trim.isEmpty || !isUrl(sponsor.sponsorUri) ||
            sponsor.aboutUri.exists(!isUrl(_)) || !isUrl(sponsor.logo.src) || sponsor.logo.darkSrc.exists(!isUrl(_)) ||
            sponsor.logo.aspectRatio <= 0,
        )(s"sponsorship for '$editionId' has an empty name or label, a non-https URL or an invalid logo aspect ratio")
    }
  }

  private def duplicateValues(label: String, values: Seq[String]): Seq[String] =
    values
      .groupBy(identity)
      .collect {
        case (value, occurrences) if occurrences.size > 1 =>
          s"duplicate $label id '$value'"
      }
      .toSeq
      .sorted
}
