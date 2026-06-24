import * as z from 'zod'

import { AgentPermissionModeSchema } from './agents'
import { AgentSessionWorkspaceSourceSchema } from './agentWorkspaces'

export const AgentChannelTypeSchema = z.enum(['telegram', 'qq', 'wechat', 'discord', 'slack'])
export type AgentChannelType = z.infer<typeof AgentChannelTypeSchema>

export const TelegramAgentChannelConfigSchema = z.strictObject({
  bot_token: z.string(),
  allowed_chat_ids: z.array(z.string()).optional()
})

function createAgentChannelMutationSchema<
  TType extends AgentChannelType,
  TConfig extends z.ZodType<Record<string, unknown>>
>(type: TType, configSchema: TConfig) {
  return z.strictObject({
    type: z.literal(type),
    ...MutableAgentChannelFields,
    config: configSchema
  })
}

export const TelegramAgentChannelEntitySchema = createAgentChannelEntitySchema(
  'telegram',
  TelegramAgentChannelConfigSchema
)
export const WeChatAgentChannelEntitySchema = createAgentChannelEntitySchema('wechat', WeChatAgentChannelConfigSchema)
export const DiscordAgentChannelEntitySchema = createAgentChannelEntitySchema(
  'discord',
  DiscordAgentChannelConfigSchema
)
export const SlackAgentChannelEntitySchema = createAgentChannelEntitySchema('slack', SlackAgentChannelConfigSchema)

export const AgentChannelEntitySchema = z.discriminatedUnion('type', [
  TelegramAgentChannelEntitySchema,
  QQAgentChannelEntitySchema,
  WeChatAgentChannelEntitySchema,
  DiscordAgentChannelEntitySchema,
  SlackAgentChannelEntitySchema
])
export type AgentChannelEntity = z.infer<typeof AgentChannelEntitySchema>

export const TelegramCreateAgentChannelSchema = createAgentChannelMutationSchema(
  'telegram',
  TelegramAgentChannelConfigSchema
)
export const QQCreateAgentChannelSchema = createAgentChannelMutationSchema('qq', QQAgentChannelConfigSchema)
export const DiscordCreateAgentChannelSchema = createAgentChannelMutationSchema(
  'discord',
  DiscordAgentChannelConfigSchema
)
export const SlackCreateAgentChannelSchema = createAgentChannelMutationSchema('slack', SlackAgentChannelConfigSchema)

export const CreateAgentChannelSchema = z.discriminatedUnion('type', [
  TelegramCreateAgentChannelSchema,
  QQCreateAgentChannelSchema,
  WeChatCreateAgentChannelSchema,
  DiscordCreateAgentChannelSchema,
  SlackCreateAgentChannelSchema
])
export type CreateAgentChannelDto = z.infer<typeof CreateAgentChannelSchema>

export const UpdateAgentChannelSchema = z.strictObject({
  name: z.string().optional(),
  agentId: z.string().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  workspace: AgentSessionWorkspaceSourceSchema.optional(),
  config: z
    .union([
      TelegramAgentChannelConfigSchema,
      QQAgentChannelConfigSchema,
      WeChatAgentChannelConfigSchema,
      DiscordAgentChannelConfigSchema,
      SlackAgentChannelConfigSchema
    ])
    .optional(),
  isActive: z.boolean().optional(),
  activeChatIds: z.array(z.string()).optional(),
  permissionMode: AgentPermissionModeSchema.nullable().optional()
})
export type UpdateAgentChannelDto = z.infer<typeof UpdateAgentChannelSchema>

export const AgentChannelListQuerySchema = z.strictObject({
  agentId: z.string().optional(),
  type: AgentChannelTypeSchema.optional()
})
export type AgentChannelListQuery = z.infer<typeof AgentChannelListQuerySchema>

export type AgentChannelSchemas = {
  '/agent-channels': {
    GET: {
      query?: AgentChannelListQuery
      response: AgentChannelEntity[]
    }
    POST: {
      body: CreateAgentChannelDto
      response: AgentChannelEntity
    }
  }

  '/agent-channels/:channelId': {
    GET: {
      params: { channelId: string }
      response: AgentChannelEntity
    }
    PATCH: {
      params: { channelId: string }
      body: UpdateAgentChannelDto
      response: AgentChannelEntity
    }
    DELETE: {
      params: { channelId: string }
      response: void
    }
  }
}
