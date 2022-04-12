package services.newsletters.model

case class EmailEmbed(
    name: String,
    title: String,
    description: String,
    successHeadline: String,
    successDescription: String,
    hexCode: String,
    imageUrl: Option[String],
)
