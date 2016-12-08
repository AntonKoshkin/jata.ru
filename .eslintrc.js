module.exports = {
	"extends": "airbnb-base/legacy",
	"env": {
		"es6": true
	},
	"parserOptions": {
		"ecmaVersion": 6,
		"sourceType": "module",
		"ecmaFeatures": {
			"modules": true
		}
	},
	"rules": {
		"comma-dangle": ["error", {
			"arrays": "never",
			"objects": "always-multiline",
			"functions": "ignore"
		}],
		"consistent-return": ["error", {"treatUndefinedAsUnspecified": true}],
		"default-case": ["error", { "commentPattern": "^skip\\sdefault" }],
		"func-names": ["error", "never"],
		"indent": ["error", "tab", {
			"SwitchCase": 1
		}],
		"key-spacing": ["error", {"align": "colon"}],
		"no-console": ["error", {allow: ["log", "warn", "error"]}],
		"no-lonely-if": "off",
		"no-param-reassign": ["error", { "props": false }],
		"no-tabs": "off",
		"no-unused-vars": ["error", { "vars": "local", "args": "after-used" }],
		"object-curly-spacing": ["error", "never"],
		"space-before-function-paren": ["error", "never"],
		"no-plusplus": "off",
		"no-restricted-syntax": ["error", "WithStatement"]
	},
}