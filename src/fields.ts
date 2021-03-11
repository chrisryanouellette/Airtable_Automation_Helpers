import { Table, Record } from '@airtable/blocks/models'
import { Table as T } from './types/tables'
import { Record as R } from './types/records'
import { tables } from './tables'
import { Mapping } from './types/mappings'
import { format, formatDate } from './utils'
import { CollaboratorData } from '@airtable/blocks/dist/types/src/types/collaborator'
import { FieldType } from './types/fieldTypes'

export const fields = (function () {
	function handleString(value: unknown): string {
		return value as string
	}

	function handleNumber(value: unknown): number {
		return Number(value)
	}

	function handleDate(value: unknown): string {
		const date = new Date((value as string).replace(/-/g, '/'))
		return !isNaN(date.getTime()) ? formatDate(date) : null
	}

	function handleDateTime(value: unknown): string {
		const dateTime = new Date((value as string).slice(0, -1))
		return !isNaN(dateTime.getTime()) ? format(dateTime) : null
	}

	function handleObject<T extends Object>(
		value: unknown,
		required: string[]
	): value is T {
		if (!value) return false
		if (!required.some((r) => value.hasOwnProperty(r))) {
			throw new Error(
				`Object is required to have one of the following fields ${required
					.map((r) => '"' + r + '"')
					.join(', ')}`
			)
		}
		return true
	}

	function handleArray<T>(value: unknown): Array<T> {
		if (!Array.isArray(value)) {
			throw new Error(`Field must be an array`)
		}
		return value
	}

	function handleSelect(value: unknown): T.SelectOption {
		if (typeof value === 'string') return { name: value }
		return handleObject<T.SelectOption>(value, ['name', 'id']) && value
	}

	function handleCollaborator(
		value: unknown
	): CollaboratorData | CollaboratorData[] {
		if (typeof value === 'object') {
			return (
				handleObject<CollaboratorData>(value, ['email', 'id']) && value
			)
		} else if (Array.isArray(value)) {
			return value.map((v: CollaboratorData) => {
				return handleObject<CollaboratorData>(v, ['email', 'id']) && v
			})
		}
	}

	function handleMultiSelectsOrRecords(
		value: unknown
	): (T.SelectOption | T.LinkedRecord)[] {
		return handleArray<T.SelectOption | T.LinkedRecord>(value).map((v) => {
			if (typeof value === 'string') return { id: value }
			return (
				handleObject<T.SelectOption | T.LinkedRecord>(v, [
					'name',
					'id',
				]) && v
			)
		})
	}

	function handleMultiAttachments(value: unknown): T.Attachment[] {
		return handleArray<T.Attachment>(value).map((v) => {
			return handleObject<T.Attachment>(v, ['url', 'id']) && v
		})
	}

	const fieldTypeMappings: {
		[index: string]: (value: unknown) => T.FieldTypes
	} = {
		[FieldType.SINGLE_LINE_TEXT]: handleString,
		[FieldType.MULTILINE_TEXT]: handleString,
		[FieldType.RICH_TEXT]: handleString,
		[FieldType.CHECKBOX]: handleString,
		[FieldType.EMAIL]: handleString,
		[FieldType.PHONE_NUMBER]: handleString,
		[FieldType.URL]: handleString,
		[FieldType.FORMULA]: handleString,
		[FieldType.NUMBER]: handleNumber,
		[FieldType.PERCENT]: handleNumber,
		[FieldType.CURRENCY]: handleNumber,
		[FieldType.COUNT]: handleNumber,
		[FieldType.AUTO_NUMBER]: handleNumber,
		[FieldType.DATE]: handleDate,
		[FieldType.DATE_TIME]: handleDateTime,
		[FieldType.LAST_MODIFIED_TIME]: handleDateTime,
		[FieldType.CREATED_TIME]: handleDateTime,
		[FieldType.SINGLE_SELECT]: handleSelect,
		[FieldType.MULTIPLE_RECORD_LINKS]: handleMultiSelectsOrRecords,
		[FieldType.MULTIPLE_SELECTS]: handleMultiSelectsOrRecords,
		[FieldType.SINGLE_COLLABORATOR]: handleCollaborator,
		[FieldType.MULTIPLE_COLLABORATORS]: handleCollaborator,
		[FieldType.MULTIPLE_ATTACHMENTS]: handleMultiAttachments,
	}

	function formatCellValue(
		field: Mapping.FieldMapping,
		value: unknown
	): T.FieldTypes {
		if (fieldTypeMappings[field.type] instanceof Function) {
			try {
				return fieldTypeMappings[field.type](value) || null
			} catch (error) {
				throw new Error(
					`Unable getting cell value for field ${field.type}. ${error.message}`
				)
			}
		} else {
			console.warn(
				`Field "${field.name}" has an unsupported type "${field.type}". Return unkown value.`
			)
			return value
		}
	}

	function convertFieldsToNames<
		T extends { [index: string]: R.CutomField }
	>(args: {
		table: Table | string
		records: Record[]
		mappings: { [label: string]: Mapping.ViewMapping }
	}): R.Record<T>[] {
		const { table, records, mappings } = args
		if (!records || !records.length) return []
		const Table = typeof table === 'string' ? tables.getTable(table) : table
		const mappingsForTable = tables.getMappingsForTable({
			table: Table,
			mappings,
		})
		const fieldMappings = tables.getMappingsForViews({
			viewMappings: mappingsForTable,
		})
		return records.map((record) => {
			const fields: { [index: string]: R.CutomField } = {}
			Object.entries(fieldMappings).forEach(([key, field]) => {
				const value: unknown = record.getCellValue(field.id)
				if (value === null || value === undefined) {
					fields[key] = null
				} else {
					fields[key] = formatCellValue(field, value)
				}
			})
			return {
				id: record.id,
				name: record.name,
				tableId: Table.id,
				fields: fields as T,
			}
		})
	}

	function convertFieldsToIds(args: {
		table: Table | string
		fields: { [index: string]: R.CutomField }
		mappings: { [label: string]: Mapping.ViewMapping }
		opts?: {
			fieldsOnly: boolean
		}
	}): R.LockedRecordFields {
		const { table, fields, mappings, opts } = args
		if (!fields || !Object.values(fields).length) {
			throw new Error('No fields where passed to convertFieldsToIds.')
		}
		const mappingsForTable = tables.getMappingsForTable({
			table,
			mappings,
		})
		const fieldMappings = tables.getMappingsForViews({
			viewMappings: mappingsForTable,
		})
		const converedFields: R.RecordFields = {}
		Object.entries(fields)
			.filter(([key, value]) => {
				if (!fieldMappings[key]?.type || !fieldMappings[key]?.id) {
					console.warn(`Could not find mapping for ${key}`)
					return false
				}
				if (opts?.fieldsOnly && fields[key] === undefined) {
					return false
				}
				return true
			})
			.map(([key, value]) => {
				const field = fieldMappings[key]
				if (value === null || value === undefined) {
					converedFields[field.id] = null
				} else if (field.type === FieldType.DATE) {
					converedFields[field.id] =
						value instanceof Date ? value.toDateString() : value
				} else if (field.type === FieldType.DATE_TIME) {
					converedFields[field.id] =
						value instanceof Date ? value.toISOString() : value
				} else {
					converedFields[field.id] = formatCellValue(field, value)
				}
			})
		return converedFields
	}

	return {
		convertFieldsToNames,
		convertFieldsToIds,
		formatCellValue,
	}
})()

export const formatCellValue = fields.formatCellValue
