# Deployment

Production: https://gravity.mattvildibill.com

Source: https://github.com/mattvildibill/gravity-unscripted

The repository's Vercel project builds pushes to `main` using `npm run build` and serves `dist/`. Other branches can receive previews. No backend, package installation, application secrets or database are required. Retain the existing Git connection; do not copy unrelated deployment identities or credentials into source.

The portfolio opens this project in its own browser tab. `/#chaos` is a direct link to the checked small-change comparison; `/` opens the figure-eight. Current links and shared experiment fragments are retained across static hosting.

`vercel.json` sets output/build commands and response headers. The frame-ancestor policy keeps the public portfolio and loopback development origin allowed for compatibility. The local embed bridge validates its parent origin and only runs when embedded; it does no work in the normal standalone project. Legacy host-specific configuration has been removed from this repository.

Keep mathematical attributions, license notices and model limitations. No deployment is implied by editing or validating this checkout; publication is a separate action.
