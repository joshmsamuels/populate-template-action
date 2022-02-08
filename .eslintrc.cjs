module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Node applications with the type module require local file imports to include the extension,
    // so we require them for non-package imports. https://stackoverflow.com/a/67105989.
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'ignorePackages',
      },
    ],
  },
};
