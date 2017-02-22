package structureddata

import com.gu.contentapi.client.model.v1.{Asset => ApiAsset, AssetFields => ApiAssetFields, AssetType => ApiAssetType, Atoms => ApiAtoms, CapiDateTime, ContentFields => ApiContentFields, ElementType => ApiElementType, Tag => ApiTag, TagType => ApiTagType, Content => ApiContent, Element => ApiElement}
import com.gu.contentatom.thrift.AtomData.Recipe
import com.gu.contentatom.thrift.{Atom, Image}
import services.IndexPageItem


object AtomTransformer {

  def recipeAtomToContent(atom: Atom): Option[IndexPageItem] = atom.data match {
    case Recipe(recipe) =>

      def trailText: String = {
        val credits = if (recipe.credits.nonEmpty) Some(s"by ${recipe.credits.mkString(", ")}") else None
        val maybeServes = recipe.serves map { s => if (s.to == s.from) s"${s.`type`} ${s.from}" else s"${s.`type`} ${s.from} - ${s.to}" }
        val maybeCookingTime = recipe.time.cooking.map (cTime => s"cooking time $cTime minutes")
        val maybePreparationTime = recipe.time.preparation.map (pTime => s"preparation time $pTime minutes")

        Seq(credits, maybeServes, maybeCookingTime, maybePreparationTime).flatten.mkString(", ").capitalize
      }

      val maybeByline = if (recipe.credits.nonEmpty) Some(recipe.credits.mkString(", ")) else None
      val webUrl = s"${conf.Configuration.site.host}/${recipe.sourceArticleId}"
      val apiUrl = s"${conf.Configuration.contentApi.contentApiHost}/${recipe.sourceArticleId}"
      val webPublicationDate = atom.contentChangeDetails.published.map(d => CapiDateTime(d.date, ""))
      val fields = Some(ApiContentFields(headline = Some(s"${recipe.title}"), byline = maybeByline, trailText = Some(trailText)))
      val imageElements = recipe.images map atomImageToApiElement

      def tag(id: String, tagType: ApiTagType, webTitle: String) = ApiTag(
        id = id,
        `type` = tagType,
        sectionId = None,
        sectionName = None,
        webTitle = webTitle,
        webUrl = s"${conf.Configuration.site.host}/$id",
        apiUrl = "",
        twitterHandle = None,
        bio = None,
        description = None,
        emailAddress = None,
        bylineImageUrl = None,
        podcast = None,
        references = Seq.empty,
        paidContentType = None
      )

      recipe.sourceArticleId.map { articleId =>
        IndexPageItem(
          ApiContent(
            id = articleId,
            sectionId = None,
            sectionName = None,
            webPublicationDate = webPublicationDate,
            webTitle = recipe.title,
            webUrl = webUrl,
            apiUrl = apiUrl,
            fields = fields,
            tags = Seq(
              tag("tone/recipes", ApiTagType.Tone, webTitle = "Recipes")
            ),
            elements = Some(imageElements),
            atoms = Some(ApiAtoms(recipes = Some(Seq(atom))))
          )
        )
      }

    case _ => None
  }

  def atomImageToApiElement(image: Image): ApiElement =
    ApiElement(
      id = image.mediaId,
      relation = "main",
      `type` = ApiElementType.Image,
      galleryIndex = None,
      assets = image.assets.map { asset =>
        ApiAsset(
          `type` = ApiAssetType.Image,
          mimeType = asset.mimeType,
          file = Some(asset.file),
          typeData = Some(ApiAssetFields(
            height = asset.dimensions.map(_.height),
            width = asset.dimensions.map(_.width)
          ))
        )
      }
    )

}
