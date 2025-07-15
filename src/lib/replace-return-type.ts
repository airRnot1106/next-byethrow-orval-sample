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
const variableStatements = file
  .getVariableStatements()
  .filter((stmt) => stmt.hasExportKeyword());

const functions = variableStatements.flatMap((stmt) =>
  stmt.getDeclarations().filter((decl) => {
    const initializer = decl.getInitializer();
    if (!initializer) return false;

    // Check if it's an arrow function
    if (initializer.getKind() !== SyntaxKind.ArrowFunction) return false;

    const arrowFunc = initializer.asKindOrThrow(SyntaxKind.ArrowFunction);
    const returnType = arrowFunc.getReturnTypeNode();
    if (!returnType) return false;

    const returnTypeText = returnType.getText();
    return returnTypeText.startsWith('Promise<');
  }),
);

console.log(`Found ${functions.length} functions to modify`);

// Process each function
functions.forEach((decl) => {
  const initializer = decl.getInitializer();
  if (!initializer) return;

  const arrowFunc = initializer.asKindOrThrow(SyntaxKind.ArrowFunction);
  const returnTypeNode = arrowFunc.getReturnTypeNode();
  if (!returnTypeNode) return;

  const returnTypeText = returnTypeNode.getText();

  // Extract the type parameter from Promise<T>
  const match = returnTypeText.match(/^Promise<(.+)>$/);
  if (!match) return;

  const typeParam = match[1];
  const newReturnType = `Result.ResultAsync<${typeParam}, Error>`;

  console.log(
    `Replacing ${returnTypeText} with ${newReturnType} in function ${decl.getName()}`,
  );

  // Replace the return type
  returnTypeNode.replaceWithText(newReturnType);
});

await project.save();
