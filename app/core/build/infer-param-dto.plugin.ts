import ts from "typescript";
import MagicString from "magic-string";
import type { Plugin } from "vite";

/**
 * Réplica mínima do @nestjs/swagger CLI plugin: permite escrever
 * `@Body() data: SomeDto` / `@Query() filters: SomeDto` (sem repetir a
 * classe no decorator) e injeta a classe como argumento em build-time, lendo
 * a anotação de tipo do próprio parâmetro via TS Compiler API.
 *
 * Necessário porque o runtime não tem acesso a `design:paramtypes`: o Vite
 * aqui transpila com esbuild/rolldown, que não emitem
 * `emitDecoratorMetadata` (por isso a injeção de dependência do framework
 * também usa tokens explícitos em vez de inferir pelo tipo).
 *
 * A injeção só altera o texto fonte antes da transpilação; o decorator em
 * si (params.decorator.ts) continua recebendo a classe do jeito que já
 * esperava quando alguém escreve `@Body(SomeDto)` manualmente.
 */

const INFERRABLE_DECORATORS = new Set(["Body", "Query"]);

// Tipos que não fazem sentido como schema de DTO — se o parâmetro for
// tipado com algum desses, não tem o que inferir.
const NON_DTO_TYPE_NAMES = new Set([
  "String",
  "Number",
  "Boolean",
  "Object",
  "Array",
  "Promise",
  "Date",
  "RegExp",
  "Map",
  "Set",
  "Record",
  "Partial",
  "Required",
  "Readonly",
  "Pick",
  "Omit",
  "Exclude",
  "Extract",
  "ReturnType",
  "Function",
]);

function isTypeOnlyImportOf(sourceFile: ts.SourceFile, name: string): boolean {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
    const clause = statement.importClause;
    if (clause.isTypeOnly) {
      if (clause.name?.text === name) return true;
      if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        if (clause.namedBindings.elements.some((el) => el.name.text === name)) return true;
      }
      continue;
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      const el = clause.namedBindings.elements.find((el) => el.name.text === name);
      if (el?.isTypeOnly) return true;
    }
  }
  return false;
}

export function inferParamDtoPlugin(): Plugin {
  return {
    name: "infer-param-dto",
    enforce: "pre",
    transform(code, id) {
      if (!/\.controller\.tsx?$/.test(id.split("?")[0])) return;
      if (!code.includes("@Body") && !code.includes("@Query")) return;

      const sourceFile = ts.createSourceFile(id, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      const s = new MagicString(code);
      let mutated = false;

      const visit = (node: ts.Node) => {
        if (ts.isParameter(node) && node.type && ts.canHaveDecorators(node)) {
          const decorators = ts.getDecorators(node) ?? [];

          for (const decorator of decorators) {
            if (!ts.isCallExpression(decorator.expression)) continue;
            const callExpr = decorator.expression;
            if (!ts.isIdentifier(callExpr.expression)) continue;
            if (!INFERRABLE_DECORATORS.has(callExpr.expression.text)) continue;
            if (callExpr.arguments.length > 0) continue; // já tem key/DTO explícito

            const typeNode = node.type;
            if (!typeNode || !ts.isTypeReferenceNode(typeNode)) continue;
            if (!ts.isIdentifier(typeNode.typeName)) continue; // ignora qualified names

            const typeName = typeNode.typeName.text;
            if (NON_DTO_TYPE_NAMES.has(typeName)) continue;
            if (isTypeOnlyImportOf(sourceFile, typeName)) continue; // não existe em runtime

            const calleeEnd = callExpr.expression.getEnd();
            const openParenIndex = code.indexOf("(", calleeEnd);
            if (openParenIndex === -1) continue;

            s.appendLeft(openParenIndex + 1, typeName);
            mutated = true;
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);

      if (!mutated) return;
      return { code: s.toString(), map: s.generateMap({ hires: true }) };
    },
  };
}
