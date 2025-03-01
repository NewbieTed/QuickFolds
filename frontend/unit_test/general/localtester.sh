cd ../../..

# runs functionality test
#npx mocha -r ts-node/register setup.ts general/**.test.ts
npx tsx ./node_modules/mocha/bin/mocha --require frontend/unit_test/setup.ts "**/*.test.ts"