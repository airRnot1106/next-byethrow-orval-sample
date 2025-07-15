import { Project, SyntaxKind } from 'ts-morph';

console.log('Replacing return types...');

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const file = project.getSourceFileOrThrow(
  'src/lib/generated/fetchers/eCSiteAPI.ts',
);

// Add Result import if it doesn't exist
if (
  !file.getImportDeclaration(
    (imp) => imp.getModuleSpecifierValue() === '@praha/byethrow',
  )
) {
  file.addImportDeclaration({
    moduleSpecifier: '@praha/byethrow',
    namedImports: [{ name: 'Result', isTypeOnly: true }],
  });
}

// Get all exported arrow functions that return Promise<T>
const functions = file
  .getVariableStatements()
  .filter((stmt) => stmt.hasExportKeyword())
  .flatMap((stmt) =>
    stmt.getDeclarations().filter((decl) => {
      const init = decl.getInitializer();
      if (!init || init.getKind() !== SyntaxKind.ArrowFunction) return false;

      const arrowFunc = init.asKindOrThrow(SyntaxKind.ArrowFunction);
      if (!arrowFunc.isAsync()) return false;

      const returnTypeNode = arrowFunc.getReturnTypeNode();
      if (!returnTypeNode) return false;

      // Check if return type is Promise<T> using AST
      if (returnTypeNode.getKind() !== SyntaxKind.TypeReference) return false;

      const typeRef = returnTypeNode.asKind(SyntaxKind.TypeReference);
      if (!typeRef) return false;

      const typeName = typeRef.getTypeName();
      if (typeName.getKind() !== SyntaxKind.Identifier) return false;

      const identifier = typeName.asKind(SyntaxKind.Identifier);
      if (!identifier || identifier.getText() !== 'Promise') return false;

      const typeArgs = typeRef.getTypeArguments();
      return typeArgs.length === 1;
    }),
  );

console.log(`Found ${functions.length} functions to modify`);

// Process each function
functions.forEach((decl) => {
  const arrowFunc = decl
    .getInitializerOrThrow()
    .asKindOrThrow(SyntaxKind.ArrowFunction);
  const returnTypeNode = arrowFunc.getReturnTypeNodeOrThrow();

  // Ensure it's a TypeReference (Promise<T>)
  if (returnTypeNode.getKind() !== SyntaxKind.TypeReference) return;

  const typeRef = returnTypeNode.asKind(SyntaxKind.TypeReference);
  if (!typeRef) return;

  const typeArgs = typeRef.getTypeArguments();
  if (typeArgs.length !== 1) return;

  const typeParam = typeArgs[0];
  if (!typeParam) return;

  const typeParamText = typeParam.getText();

  console.log(
    `Replacing Promise<${typeParamText}> with Result.ResultAsync<${typeParamText}, Error> in function ${decl.getName()}`,
  );

  // Create new type reference node using AST
  const newTypeRef = project
    .createWriter()
    .write('Result.ResultAsync<')
    .write(typeParamText)
    .write(', Error>')
    .toString();

  returnTypeNode.replaceWithText(newTypeRef);
});

await project.save();
