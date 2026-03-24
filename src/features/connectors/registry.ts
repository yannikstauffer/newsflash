import { digitecConnector } from "./sources/digitec-connector"
import { engadgetConnector } from "./sources/engadget-connector"
import { galaxusConnector } from "./sources/galaxus-connector"
import { heiseConnector } from "./sources/heise-connector"
import { srfConnector } from "./sources/srf-connector"
import { ubergizmoConnector } from "./sources/ubergizmo-connector"
import { winfutureConnector } from "./sources/winfuture-connector"

import type { Connector } from "./types"

export const connectors: Connector[] = [
  digitecConnector,
  galaxusConnector,
  srfConnector,
  winfutureConnector,
  engadgetConnector,
  heiseConnector,
  ubergizmoConnector,
]
