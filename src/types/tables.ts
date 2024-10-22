import type { Field, View } from '@airtable/blocks/models'

export declare namespace Table {
	export interface SelectOption {
		id?: string
		name?: string
		color?: string
	}
	export interface LinkedRecord {
		id: string
		name?: string
	}
	export interface AttachmentThumbnails {
		url: string
		width: number
		height: number
	}
	export interface Attachment {
		id: string
		filename: string
		size?: number
		type?: string
		thumbnails?: {
			small?: AttachmentThumbnails
			large?: AttachmentThumbnails
			full?: AttachmentThumbnails
		}
	}
	export interface LookUp {
		linkedRecordId: string
		value: unknown
	}
	export type FieldTypes =
		| string
		| number
		| SelectOption
		| SelectOption[]
		| Attachment
		| LookUp
		| null
	export interface SortOpts {
		field: Field | string
		direction?: 'asc' | 'desc'
	}
	export interface QueryOpts {
		sorts?: Array<Table.SortOpts>
		fields?: Array<Field | string>
		recordColorMode?: {
			type: any
			selectField?: Field
			view?: View
		}
	}
}
