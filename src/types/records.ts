import { CollaboratorData } from '@airtable/blocks/dist/types/src/types/collaborator'
import { Table } from './tables'

export declare namespace Record {
	type CutomField =
		| string
		| number
		| boolean
		| Date
		| Table.SelectOption
		| Table.SelectOption[]
		| Table.LinkedRecord
		| Table.LinkedRecord[]
		| CollaboratorData
		| CollaboratorData[]

	interface RecordFields {
		[index: string]: Record.CutomField
	}
	type LockedRecordFields = {
		readonly [index: string]: Record.CutomField
	}
	interface Record<T extends { [index: string]: Record.CutomField }> {
		id: string
		name: string
		tableId: string
		fields: {
			[P in keyof T]: T[P]
		}
	}
	interface UpdateRecord {
		id: string
		fields: LockedRecordFields
	}
	type ModifiedRecord =
		| string
		| { fields: Record.LockedRecordFields }
		| Record.UpdateRecord
}
