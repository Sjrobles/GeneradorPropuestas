import type { AgoraApi } from './agora-api'
import { backendEnabled } from './api-mode'
import { HybridAgoraApi } from './hybrid-agora-api'
import { MockAgoraApi } from './mock-agora-api'

export const agoraApi: AgoraApi = backendEnabled
  ? new HybridAgoraApi()
  : new MockAgoraApi()
