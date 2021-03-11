import { Base, Field, Table, View } from '@airtable/blocks/models'
import { Mapping } from './types/mappings'

declare const base: Base

export const tables = {
	getTable(tableNameOrId: string): Table | null {
		let table: Table = null
		try {
			table = base.getTable(tableNameOrId)
		} catch (error) {
			table = base.tables.find((t) => t.name === tableNameOrId) || null
		}
		return table
	},
	getView(table: Table | string, viewNameOrId: string): View | null {
		const Table = typeof table === 'string' ? tables.getTable(table) : table
		let view: View = null
		try {
			view = Table.getView(viewNameOrId)
		} catch (error) {
			if (!view) {
				view = Table.views.find((v) => v.name === viewNameOrId) || null
			}
		}
		return view
	},
	getField(table: Table | string, fieldNameOrId: string): Field | null {
		const Table = typeof table === 'string' ? tables.getTable(table) : table
		let field: Field = null
		try {
			field = Table.getField(fieldNameOrId)
		} catch (error) {
			field = Table.fields.find((f) => f.name === fieldNameOrId) || null
		}
		return field
	},
	getFields(table: Table | string, fieldNamesOrIds: string[]): Field[] {
		const Table = typeof table === 'string' ? tables.getTable(table) : table
		const fields: Field[] = []
		fieldNamesOrIds.forEach((opt) => tables.getField(Table, opt))
		return fields
	},
	/** Returns the View mappings for a table */
	getMappingsForTable(args: {
		table: Table | string
		mappings: { [label: string]: Mapping.ViewMapping }
		opts?: {
			refNames?: string[]
		}
	}): { [refName: string]: Mapping.ViewMapping } {
		const { table, mappings, opts } = args
		const tableId = typeof table !== 'string' ? table.id : table
		const items = Object.entries(mappings).filter(
			([refName, mapping]) => mapping.tableId === tableId
		)
		if (opts?.refNames) {
			return Object.fromEntries(
				items.filter(([refName, mapping]) =>
					opts.refNames.includes(refName)
				)
			)
		} else {
			return Object.fromEntries(items)
		}
	},
	/** Returns the Field mappings for a View */
	getMappingsForView(args: {
		view: View | string
		mappings: { [label: string]: Mapping.ViewMapping }
		opts?: {
			refNames?: string[]
			fieldIds?: string[]
		}
	}): { [refName: string]: Mapping.FieldMapping } {
		const { view, mappings, opts } = args
		const viewId = typeof view !== 'string' ? view.id : view
		const viewMapping = Object.values(mappings).find(
			(mapping) => mapping.id === viewId
		)
		if (opts?.refNames || opts?.fieldIds) {
			const filter = opts.refNames || opts.fieldIds
			const fieldMappings = Object.entries(
				viewMapping.fields
			).filter(([refName, mapping]) => filter.includes(refName))
			return Object.fromEntries(fieldMappings)
		} else {
			return viewMapping.fields
		}
	},
	/** Returns all the Field mappings for a Table */
	getMappingsForViews(args: {
		viewMappings: {
			[refName: string]: Mapping.ViewMapping
		}
	}): { [refName: string]: Mapping.FieldMapping } {
		const { viewMappings } = args
		const fieldMappings: { [refName: string]: Mapping.FieldMapping } = {}
		Object.values(viewMappings).forEach((viewMapping) =>
			Object.entries(viewMapping.fields).forEach(
				([refName, fieldMapping]) =>
					(fieldMappings[refName] = fieldMapping)
			)
		)
		return fieldMappings
	},
}
