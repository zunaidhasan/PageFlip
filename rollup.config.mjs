import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

const plugins = [
    postcss(),
    typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        compilerOptions: {
            declaration: false,
            declarationMap: false,
        },
    }),
    terser(),
];

export default [
    {
        input: 'src/PageFlip.ts',
        output: [
            {
                file: 'dist/js/page-flip.browser.js',
                format: 'umd',
                name: 'St',
                sourcemap: true,
                exports: 'named',
            },
        ],
        plugins,
    },
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/js/page-flip.module.js',
                format: 'es',
                sourcemap: true,
            },
        ],
        plugins,
    },
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/js/page-flip.cjs.js',
                format: 'cjs',
                sourcemap: true,
                exports: 'named',
            },
        ],
        plugins,
    },
];
