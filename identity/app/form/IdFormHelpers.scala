package form

import views.html.helper.FieldConstructor
import views.html.fragments.form.identityFieldConstructor
import play.api.data.Field

object IdFormHelpers {
  implicit val fields = FieldConstructor(identityFieldConstructor.f)

  def Password(field: Field, args: (Symbol, Any)*): Input = {
    val updatedArgs = updateArgs(args, 'autocomplete -> "off", 'autocapitalize -> "off", 'autocorrect -> "off")
    new Input("password", field, updatedArgs:_*)
  }

  def Email(field: Field, args: (Symbol, Any)*): Input = {
    val updatedArgs = updateArgs(args, 'autocomplete -> "on", 'autocapitalize -> "off", 'autocorrect -> "off")
    new Input("email", field, updatedArgs:_*)
  }

  def Username(field: Field, args: (Symbol, Any)*): Input = {
    val updatedArgs = updateArgs(args, 'autocomplete -> "off", 'autocapitalize -> "off", 'autocorrect -> "off")
    new Input("text", field, updatedArgs:_*)
  }

  def Input(field: Field, args: (Symbol, Any)*): Input = {
    new Input("text", field, args:_*)
  }

  private def updateArgs(args: Seq[(Symbol, Any)], defaults: (Symbol, Any)*): Seq[(Symbol, Any)] = {
    val argsMap = collection.mutable.Map(args:_*)
    defaults.foreach { case (symbol, default) =>
      if (!argsMap.contains(symbol)) argsMap.put(symbol, default)
    }
    argsMap.toSeq
  }
}

class Input(val inputType: String, val field: Field, initialArgs: (Symbol, Any)*) {
  val cls = "text-input " + getArgOrElse('class, "", initialArgs)
  val autocomplete = getArgOrElse('autocomplete, "on", initialArgs)
  val autocapitalize = getArgOrElse('autocapitalize, "on", initialArgs)
  val autocorrect = getArgOrElse('autocorrect, "on", initialArgs)
  val spellcheck = getArgOrElse('spellcheck, "false", initialArgs)
  val autofocus = getArgOrElse('autofocus, false, initialArgs)
  val required = field.constraints.exists(constraint => constraint._1 == "constraint.required")

  val args = initialArgs ++ Seq('_showConstraints -> false).filter(_._1 != 'type)

  private def getArgOrElse[T](property: Symbol, default: T, args: Seq[(Symbol, Any)]): T =
    args.toMap.get(property).map(_.asInstanceOf[T]).getOrElse(default)
}
