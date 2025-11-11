import { NestFactory } from '@nestjs/core';
import { INestApplication, LogLevel } from '@nestjs/common';
import { AppModule } from './app.module.js';
import * as Sentry from '@sentry/node';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SpelunkerModule } from 'nestjs-spelunker';
import * as fs from 'fs';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter.js';

async function bootstrap() {
  const logLevels: LogLevel[] =
    process.env['NODE_ENV'] === 'production'
      ? ['error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  if (process.env['SENTRY_DSN']) {
    Sentry.init({
      dsn: process.env['SENTRY_DSN'],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
  }

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Assistant API')
    .setDescription('The API for the Web Assistant application.')
    .setVersion('1.0')
    .build();

  if (process.env.NODE_ENV === 'development') {
    generateDependencyGraph(app);
  }

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env['PORT'] ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

function generateDependencyGraph(app: INestApplication) {
  // Module dependencies graph
  const tree = SpelunkerModule.explore(app);
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);
  const mermaidEdges = edges
    .map(({ from, to }) => `  ${from.module.name}-->${to.module.name}`)
    // filter out modules from the chart if you need
    .filter(
      (edge) =>
        !edge.includes('FilteredModule') && !edge.includes('OtherExample'),
    )
    .sort();
  // write into file
  fs.writeFileSync(
    'deps.mermaid',
    `graph LR
${mermaidEdges.join('\n')}`,
  );
}
