package uiComponent.core

import java.io.Reader
import javax.script._

import jdk.nashorn.api.scripting.JSObject

import scala.util.Try

object JavascriptEngine {

  type EvalResult = JSObject

  private val shared: ScriptEngine = new ScriptEngineManager(null).getEngineByName("nashorn")

  def put(name: String, value: Object)(implicit context: SimpleScriptContext): Try[Unit] =
    Try(context.getBindings(ScriptContext.ENGINE_SCOPE).put(name, value))

  def get(evaluated: EvalResult, key: String): Try[JSObject] =
    Try(evaluated.getMember(key).asInstanceOf[JSObject])

  def eval(script: String)(implicit context: SimpleScriptContext): Try[EvalResult] =
    Try(shared.eval(script, context).asInstanceOf[EvalResult])

  def eval(cs: CompiledScript)(implicit context: SimpleScriptContext): Try[EvalResult] =
    Try(cs.eval(context).asInstanceOf[EvalResult])

  def compile(reader: Reader): Try[CompiledScript] =
    Try(shared.asInstanceOf[Compilable].compile(reader))

  def invoke(obj: EvalResult, method: String, args: JSObject*): Try[String] = Try {
    shared
      .asInstanceOf[Invocable]
      .invokeMethod(obj, method, args:_*)
      .asInstanceOf[String]
  }
}
