import pluginTypeScript from '@babel/preset-typescript'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { rollup, type OutputOptions, type RollupOptions } from 'rollup'

/**
 * @type {import('rollup').RollupOptions}
 */
const baseOptions: RollupOptions = {
  preserveEntrySignatures: 'strict',
  treeshake: {
    propertyReadSideEffects: false,
  },
  output: {
    format: 'es',
    freeze: false,
    generatedCode: {
      constBindings: true,
      objectShorthand: true,
    },
  },
  external: [
    'ws',
    'electron',
    '@playwright/test',
    'istanbul-lib-coverage',
    'istanbul-lib-report',
    'istanbul-reports',
    'v8-to-istanbul',
  ],
  plugins: [
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: [pluginTypeScript],
    }),
    nodeResolve(),
    // @ts-ignore
    commonjs(),
  ],
}

export const bundleJs = async ({ inputFile, outputFile }: { inputFile: string; outputFile: string }) => {
  const fullOptions = {
    ...baseOptions,
    input: inputFile,
    output: {
      ...baseOptions.output,
      file: outputFile,
      inlineDynamicImports: true,
    },
  }
  const input = await rollup(fullOptions)
  // @ts-ignore
  await input.write(fullOptions.output)
}

export const bundleBrowserJs = async ({
  inputFile,
  name,
  outputFile,
}: {
  inputFile: string
  name: string
  outputFile: string
}): Promise<void> => {
  const output: OutputOptions = {
    ...baseOptions.output,
    file: outputFile,
    format: 'iife',
    inlineDynamicImports: true,
    name,
  }
  const fullOptions: RollupOptions = {
    ...baseOptions,
    input: inputFile,
    output,
    plugins: [
      babel({
        babelHelpers: 'bundled',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        presets: [pluginTypeScript],
      }),
      nodeResolve({ browser: true, preferBuiltins: false }),
      // @ts-ignore
      commonjs(),
    ],
  }
  const input = await rollup(fullOptions)
  await input.write(output)
}
