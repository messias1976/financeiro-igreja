import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

/**
 * @type {import('eslint').Linter.Config}
 */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.imagine/**',
      '.cursor/**',
      'src/components/ui/**',
      '.output',
      '.nitro',
      'prettier.config.js',
      'eslint.config.js',
      'search.js',
      'seedDatabase.cjs',
      'setupDatabase.cjs',
      'src/routeTree.gen.ts',
    ],
  },
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['scripts/create-saas-owner.mjs', 'tailwind.config.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'off',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/only-throw-error': 'off', // won't work with TanStack redirects
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
)
