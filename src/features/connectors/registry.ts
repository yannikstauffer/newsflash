import { digitecConnector } from "./digitec-connector"
import { engadgetConnector } from "./engadget-connector"
import { galaxusConnector } from "./galaxus-connector"
import { heiseConnector } from "./heise-connector"
import { srfConnector } from "./srf-connector"
import { ubergizmoConnector } from "./ubergizmo-connector"
import { winfutureConnector } from "./winfuture-connector"

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
