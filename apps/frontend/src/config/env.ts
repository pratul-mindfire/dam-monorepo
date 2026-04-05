import { parseAppEnv } from '@/schemas/env'

const appEnv = parseAppEnv(import.meta.env)

export default appEnv
