import { build } from "esbuild";

build({
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.cjs",
  bundle: true,
  platform: "node",
  target: ["node14"],
  minify: true,
  treeShaking: true,
  external: [
    "bcrypt",
    "aws-sdk",
    "mock-aws-s3",
    "nock",
    // "@mapbox/node-pre-gyp",
  ],
}).catch(() => process.exit(1));
