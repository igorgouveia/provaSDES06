module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { 
      allow: ['warn', 'error'] 
    }],
    // Desabilitar regras específicas para arquivos de teste
    'no-console': 'off',
    '@typescript-eslint/no-unused-vars': 'off'
  },
  overrides: [
    {
      // Aplicar regras específicas para arquivos de teste
      files: ['**/*.test.ts', '**/*.test.tsx', '**/tests/**/*'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    },
    {
      // Aplicar regras específicas para arquivos de definição de tipos
      files: ['**/*.d.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'public/',
    '*.config.js',
    '*.setup.js'
  ]
} 