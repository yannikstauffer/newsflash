## ADDED Requirements

### Requirement: Connector implementations live in sources subdirectory
All connector implementation files SHALL reside in `src/features/connectors/sources/`. Generic connector infrastructure (`types.ts`, `base-parser.ts`, `registry.ts`, `fetch-feed.ts`) SHALL remain at `src/features/connectors/`.

#### Scenario: Source files in sources directory
- **WHEN** the project structure is inspected
- **THEN** all `*-connector.ts` files SHALL be located in `src/features/connectors/sources/`

#### Scenario: Generic files at connectors root
- **WHEN** the project structure is inspected
- **THEN** `types.ts`, `base-parser.ts`, `registry.ts`, and `fetch-feed.ts` SHALL be located at `src/features/connectors/`

### Requirement: Registry imports from sources subdirectory
The `registry.ts` file SHALL import all connector implementations from the `./sources/` path.

#### Scenario: Registry imports updated
- **WHEN** `registry.ts` is loaded
- **THEN** all connector imports SHALL use paths starting with `./sources/`
