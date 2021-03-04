import { Base, Table, View, TableOrViewQueryResult, Record } from '@airtable/blocks/models'
import { FieldType } from './types/fieldtypes'
import { Table as T } from './types/tables'
import { Record as R } from './types/records'
import { tables } from './tables'
import { Mapping } from './types/mappings'
import { format, formatDate } from './utils'

declare const base: Base

export const records = (function () {
	async function selectRecordsFromModel(
		tableOrView: Table | View,
		opts?: T.QueryOpts
	): Promise<TableOrViewQueryResult> {
		const result = await tableOrView.selectRecordsAsync(opts || {})
		if (!result.records.length) {
			console.warn(`Model "${tableOrView.name}" does not have any records.`)
		}
		return result
	}

	async function throttleTableUsage(
		records: R.ModifiedRecord[],
		fn: (records: R.ModifiedRecord[]) => Promise<string[] | void>
	): Promise<string[] | void> {
		const results: string[] = []
		let index = 0
		while (records.length > index) {
			const round = records.slice(index, 50)
			let r = (await fn(round)) as string[] | void
			if (r) results.push(...r)
			index = index + 50
		}
		return results
	}

	return {
		selectRecords(args: {
			table: Table | string
			view?: View | string
			opts?: T.QueryOpts
		}): Promise<TableOrViewQueryResult> {
			let { table, view, opts } = args
			const Table: Table =
				typeof table === 'string' ? tables.getTable(table) : (table as Table)
			if (table === null) throw new Error(`No table with name or id "${table}" found.`)
			const View: View =
				view && typeof view === 'string' ? tables.getView(table, view) : (view as View)

			if (!Table || (view && !View)) {
				throw new Error(`Select Records: Unable to find Model.`)
			}
			return View ? selectRecordsFromModel(View, opts) : selectRecordsFromModel(Table, opts)
		},
		/** Converts an AT record's fields to the provided reference names */
		convertFieldsToNames<T extends { [index: string]: R.CutomField }>(args: {
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
					const fieldValue: unknown = record.getCellValue(field.id)
					if (fieldValue === null || fieldValue === undefined) {
						fields[key] = null
					} else {
						switch (field.type) {
							case FieldType.SINGLE_LINE_TEXT:
							case FieldType.MULTILINE_TEXT:
							case FieldType.RICH_TEXT:
							case FieldType.CHECKBOX:
							case FieldType.SINGLE_SELECT:
							case FieldType.SINGLE_COLLABORATOR:
								fields[key] = fieldValue
								break
							case FieldType.NUMBER:
								fields[key] = Number(fieldValue)
								break
							case FieldType.DATE:
								const date = new Date((fieldValue as string).replace(/-/g, '/'))
								fields[key] = !isNaN(date.getTime()) ? formatDate(date) : null
								break
							case FieldType.DATE_TIME:
							case FieldType.LAST_MODIFIED_TIME:
								const dateTime = new Date((fieldValue as string).slice(0, -1))
								fields[key] = !isNaN(dateTime.getTime()) ? format(dateTime) : null
								break
							case FieldType.MULTIPLE_RECORD_LINKS:
							case FieldType.MULTIPLE_SELECTS:
							case FieldType.MULTIPLE_COLLABORATORS:
								fields[key] = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
								break
							default:
								console.warn(
									`Default field conversion used for field ${field.name} ( ${field.type} )`
								)
								fields[key] = record.getCellValueAsString(field.id)
								break
						}
					}
				})
				return {
					id: record.id,
					name: record.name,
					tableId: Table.id,
					fields: fields as T,
				}
			})
		},
		/** Converts a record's fields from the refrence names to the field ids */
		convertFieldsToIds(args: {
			table: Table | string
			fields: { [index: string]: R.CutomField }
			mappings: { [label: string]: Mapping.ViewMapping }
			opts?: {
				fieldsOnly: boolean
			}
		}): R.LockedRecordFields {
			const { table, fields, mappings, opts } = args
			if (!Object.values(fields || {}).length) {
				throw new Error('No fields where passed to convertFieldsToIds.')
			}
			const mappingsForTable = tables.getMappingsForTable({
				table,
				mappings,
			})
			const fieldMappings = tables.getMappingsForViews({
				viewMappings: mappingsForTable,
			})
			const converedFields: [string, R.CutomField][] = Object.entries(fields)
				.filter(([key, value]) => {
					if (opts?.fieldsOnly && fields[key]) return true
					if (!opts?.fieldsOnly) return true
				})
				.map(([key, value]) => {
					const fieldType = fieldMappings[key]?.type
					const fieldId = fieldMappings[key]?.id
					if (!fieldType || !fieldId) throw new Error(`Could not find mapping for ${key}`)
					switch (fieldType) {
						case FieldType.EMAIL:
						case FieldType.URL:
						case FieldType.PHONE_NUMBER:
						case FieldType.CREATED_TIME:
						case FieldType.MULTILINE_TEXT:
						case FieldType.SINGLE_LINE_TEXT:
						case FieldType.RICH_TEXT:
							return typeof value === 'string' ? [fieldId, value] : [fieldId, null]
						case FieldType.NUMBER:
							return isNaN(Number(value)) ? [fieldId, null] : [fieldId, Number(value)]
						case FieldType.CHECKBOX:
							return typeof value === 'boolean' ? [fieldId, value] : [fieldId, null]
						case FieldType.DATE:
							return value instanceof Date
								? [fieldId, value.toDateString()]
								: [fieldId, value]
						case FieldType.DATE_TIME:
							return value instanceof Date
								? [fieldId, value.toISOString()]
								: [fieldId, value]
						case FieldType.SINGLE_COLLABORATOR:
						case FieldType.SINGLE_SELECT:
							const selectOption = value as T.SelectOption
							if (selectOption === null) return [fieldId, null]
							if (!selectOption.name && !selectOption.id) {
								throw new Error(`Invalid Select Option. Missing Name or ID`)
							} else if (selectOption.id) {
								return [fieldId, { id: selectOption.id }]
							} else {
								return [fieldId, { name: selectOption.name }]
							}
						case FieldType.MULTIPLE_RECORD_LINKS:
						case FieldType.MULTIPLE_COLLABORATORS:
						case FieldType.MULTIPLE_SELECTS:
							if (value !== null && !Array.isArray(value)) {
								throw new Error(
									`Multi Selects, Collaberators, and / or, Record Links must be an Array`
								)
							}
							const selectOptions = value as T.SelectOption[]
							return [
								fieldId,
								selectOptions?.map((opt) =>
									opt.id ? { id: opt.id } : { name: opt.name }
								) || null,
							]
						default:
							throw new Error(`Unsupported Field type ${fieldType}`)
					}
				})
			return Object.fromEntries(converedFields)
		},
		async createRecords(args: {
			table: Table | string
			records: { fields: R.LockedRecordFields }[]
		}): Promise<string[]> {
			const { table, records } = args
			const Table: Table =
				typeof table === 'string' ? tables.getTable(table) : (table as Table)
			const results = await throttleTableUsage(records, (records: R.ModifiedRecord[]) =>
				Table.createRecordsAsync(records as { fields: R.LockedRecordFields }[])
			)
			return Array.isArray(results) ? results : []
		},
		async updateRecords(args: {
			table: Table | string
			records: R.ModifiedRecord[]
		}): Promise<void> {
			const { table, records } = args
			const Table: Table =
				typeof table === 'string' ? tables.getTable(table) : (table as Table)
			await throttleTableUsage(records, (records: R.ModifiedRecord[]) =>
				Table.updateRecordsAsync(records as R.UpdateRecord[])
			)
		},
		async deleteRecords(args: { table: Table | string; recordIds: string[] }): Promise<void> {
			const { table, recordIds } = args
			const Table: Table =
				typeof table === 'string' ? tables.getTable(table) : (table as Table)
			await throttleTableUsage(recordIds, (recordIds: R.ModifiedRecord[]) =>
				Table.deleteRecordsAsync(recordIds as string[])
			)
		},
	}
})()
