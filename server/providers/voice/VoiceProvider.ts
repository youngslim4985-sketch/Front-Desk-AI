import { CallContext } from "../../types/infrastructure";

export interface VoiceProvider {
  createResponse(message: string, nextActionUrl: string, context: CallContext): string;
  createGather(message: string, nextActionUrl: string, context: CallContext): string;
  failoverResponse(message: string, forwardTo?: string): string;
}
