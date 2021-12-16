package model.pressed

final case class PressedFields(
    main: String,
    body: String, // This field is the 2 paragraph body snippet to be inserted into the RSS feed description
    standfirst: Option[String],
)
