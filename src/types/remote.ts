import { Record } from './records'

export namespace Remote {
	export type Methods = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

	export interface CreateOrUpdateResponse {
		id: string
		fields: Record.RecordFields
		createdTime: string
	}
	export interface ListRecordsResponse {
		records: Remote.CreateOrUpdateResponse[]
		offset?: string
	}
	export interface DeleteResponce {
		id: string
		deleted: boolean
	}
	export type Response =
		| { records: Remote.CreateOrUpdateResponse[] }
		| { records: Remote.DeleteResponce[] }
		| Remote.ListRecordsResponse
}
