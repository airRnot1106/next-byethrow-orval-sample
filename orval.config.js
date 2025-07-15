module.exports = {
  fetcher: {
    input: './tsp-output/schema/openapi.yaml',
    output: {
      mode: 'split',
      target: './src/lib/generated/fetchers',
      schemas: './src/lib/generated/schemas',
      client: 'fetch',
      baseUrl: 'http://localhost:3000',
      mock: true,
      biome: true,
      override: {
        mutator: {
          path: './src/lib/custom-fetch.ts',
          name: 'customFetch',
          type: {
            name: 'WrappedResult',
            path: './src/lib/custom-fetch.ts',
          },
        },
        fetch: {
          // includeHttpResponseReturnType: true,
          includeHttpResponseReturnType: false,
        },
      },
    },
    hooks: {
      afterAllFilesWrite:
        'node --experimental-strip-types --experimental-transform-types --experimental-detect-module --no-warnings=ExperimentalWarning src/lib/replace-return-type.ts',
    },
  },
  zod: {
    input: './tsp-output/schema/openapi.yaml',
    output: {
      mode: 'split',
      target: './src/lib/generated/schemas',
      client: 'zod',
      baseUrl: 'http://localhost:3000',
      mock: true,
      biome: true,
      override: {
        zod: {
          generateEachHttpStatus: true,
        },
      },
    },
  },
};
