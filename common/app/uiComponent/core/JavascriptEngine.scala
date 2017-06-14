package uiComponent.core

import java.io.Reader
import javax.script._
import jdk.nashorn.api.scripting.JSObject
import scala.util.Try

object JavascriptEngine {
  private val shared: ScriptEngine = new ScriptEngineManager(null).getEngineByName("nashorn")

  def put(name: String, value: Object)(implicit context: SimpleScriptContext): Try[Unit] =
    Try(context.getBindings(ScriptContext.ENGINE_SCOPE).put(name, value))

  def eval(script: String)(implicit context: SimpleScriptContext): Try[JSObject] =
    Try(shared.eval(script, context).asInstanceOf[JSObject])
  def eval(reader: Reader)(implicit context: SimpleScriptContext): Try[JSObject] =
    Try(shared.eval(reader, context).asInstanceOf[JSObject])

  def call[A](script: JSObject)(functionName: String, args: JSObject*): Try[A] =
    Try(script.call(functionName, args:_*).asInstanceOf[A])
}
