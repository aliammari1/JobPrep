# Governance

JobPrep is a maintainer-led, source-available project.

## Roles

- **Maintainer** ([@aliammari1](https://github.com/aliammari1)): sets direction, reviews and merges PRs, cuts releases, enforces the [Code of Conduct](CODE_OF_CONDUCT.md), and owns licensing decisions.
- **Contributor**: anyone who opens an issue, discussion, or PR. Contributors who review well and ship steadily may be invited to become maintainers or triage helpers.

## How decisions are made

1. Small changes (bug fixes, docs, tests): reviewed in the PR and merged when CI passes and a maintainer approves.
2. Larger changes (features, schema changes, new dependencies or providers, public API changes): discuss in an issue first. Silence is not approval.
3. The maintainer makes the final call and explains it. Disagreement is welcome; keep it technical and respectful.

## Licensing

The project license is [Source-Available License 1.0](LICENSE.md). Changing it, or granting commercial licenses, is the maintainer's decision. Contributions are accepted under that license.

## Releases

Releases are automated with release-please from [Conventional Commits](https://www.conventionalcommits.org/) on `main`. See [CONTRIBUTING.md](CONTRIBUTING.md#commit--pr-conventions).

## Changing this document

Propose changes in a PR. The maintainer approves.
