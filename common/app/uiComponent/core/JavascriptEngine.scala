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

  def eval(cs: CompiledScript)(implicit context: SimpleScriptContext): Try[JSObject] =
    Try(cs.eval(context).asInstanceOf[JSObject])

  def compile(reader: Reader)(implicit context: SimpleScriptContext): Try[CompiledScript] =
    Try(shared.asInstanceOf[Compilable].compile(reader))

  def invoke(cs: CompiledScript, method: String, args: JSObject*)(implicit context: SimpleScriptContext): Try[String] = {
    for {
      global <- eval(cs)
      res <- Try(
        cs
          .getEngine
          .asInstanceOf[Invocable]
          .invokeMethod(global, method, args:_*)
          .asInstanceOf[String]
      )
    } yield res
  }
}
