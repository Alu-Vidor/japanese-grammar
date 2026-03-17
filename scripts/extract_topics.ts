import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/data/lessons/*.ts');

const results = [];
for (const sourceFile of project.getSourceFiles()) {
  if (sourceFile.getBaseName() === 'index.ts') continue;
  
  const varDecl = sourceFile.getVariableDeclaration(decl => {
      const typeNode = decl.getTypeNode();
      return typeNode && typeNode.getText().includes('Lesson');
  });
  
  if (varDecl) {
      const init = varDecl.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
      if (!init) continue;
      
      const idProp = init.getProperty('id');
      const titleProp = init.getProperty('title');
      const goalProp = init.getProperty('goal');
      
      let id = idProp?.getText() || '';
      if (id.includes(':')) id = id.split(':')[1].trim();
      let title = titleProp?.getText() || '';
      if (title.includes(':')) title = title.split(':')[1].trim();
      let goal = goalProp?.getText() || '';
      if (goal.includes(':')) goal = goal.split(':')[1].trim();
      
      results.push({ id, title, goal });
  }
}
console.log(JSON.stringify(results, null, 2));
