module.exports = {
  parser: 'babel-eslint',
  "extends": "airbnb",
  "env": {
    "browser": true,
    "node": true
  },
  "globals": {
    "React": true
  },
  "ecmaFeatures": {
    "jsx": true
  },
  "plugins": [
    "react"
  ]
};
