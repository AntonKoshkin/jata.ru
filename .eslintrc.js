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
		"no-tabs": "off",
		"indent": ["error", "tab", {
			"SwitchCase": 1
		}],
		"comma-dangle": ["error", {
			"arrays": "never",
			"objects": "always-multiline",
			"functions": "ignore"
		}],
		"key-spacing": ["error", {"align": "colon"}],
		"func-names": ["error", "never"],
		"space-before-function-paren": ["error", "never"],
		"object-curly-spacing": ["error", "never"],
		"no-param-reassign": ["error", { "props": false }],
		"no-console": ["error", {allow: ["log", "warn", "error"]}],
		"default-case": ["error", { "commentPattern": "^skip\\sdefault" }],
		"consistent-return": ["error", {"treatUndefinedAsUnspecified": true}],
		"no-lonely-if": "off"
	}
}