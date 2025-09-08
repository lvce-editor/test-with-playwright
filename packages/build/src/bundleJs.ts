import pluginTypeScript from '@babel/preset-typescript'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { rollup, type RollupOptions } from 'rollup'

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
  external: ['ws', 'electron', '@playwright/test'],
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
    },
  }
  const input = await rollup(fullOptions)
  // @ts-ignore
  await input.write(fullOptions.output)
}
