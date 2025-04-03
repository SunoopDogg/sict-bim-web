module.exports = {
  printWidth: 100,
  trailingComma: 'all',
  singleQuote: true,
  semi: true,
  importOrder: ['^next', '^react', '^@/(.*)$', '^@', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [
    require.resolve('@trivago/prettier-plugin-sort-imports'),
    require.resolve('prettier-plugin-tailwindcss'),
  ],
};
