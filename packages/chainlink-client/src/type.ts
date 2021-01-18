export type ChainlinkPageQuery = {
  size: number
  page: number
}

export type Data<T> = T extends Array<infer Item>
  ? {
      type: string
      id: string
      attributes: Item
      relationships: Record<string, any>
      links: Record<string, any>
    }[]
  : {
      type: string
      id: string
      attributes: T
      relationships: Record<string, any>
      links: Record<string, any>
    }

export type ChainlinkDocument<T> = {
  data: Data<T>
  meta?: Record<string, any> & {
    count: number
  }
  links?: object
  included?: object[]
}

export type ChainlinkModel = {
  id?: string
  createdAt?: string
  updatedAt?: string
}

export type SessionReq = {
  email: string
  password: string
}

export type SessionRes = {
  type: string
  id: string
  attributes: {
    [key: string]: any
    authenticated: boolean
  }
}

export type InitiatorParams = {
  schedule?: string
  time?: string
  ran?: string
  address?: string
  requesters?: string[]
  name?: string
  body?: Record<string, any>
  fromBlock?: string
  toBlock?: string
  topics?: string[]
  requestData?: Record<string, any>
  feeds?: Record<string, any>
  precision?: number
  threshold?: number
  absoluteThreshold?: number
  pollTimer?: {
    disabled?: boolean
    period?: string
  }
  idleTimer?: {
    disabled?: boolean
    duration?: string
  }
}

export type Initiator = ChainlinkModel & {
  type: string
  params?: InitiatorParams
  jobSpecId?: string
}

export type Task = {
  type: string
  params: Record<string, any>
  confirmations: number
}

export type JobSpecReq = {
  name: string
  initiators: Initiator[]
  tasks: Task[]
  startAt?: string
  endAt?: string
  minPayment?: string
}

export type JobSpecError = ChainlinkModel & {
  description: string
  occurrences: number
}

export type JobSpecRes = ChainlinkModel &
  JobSpecReq & {
    errors: JobSpecError[]
    earnings?: string
  }
