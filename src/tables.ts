import { Base, Field, Table, View } from '@airtable/blocks/models'
import { Mapping } from './types/mappings'

declare const base: Base

export const tables = {
	getTable(tableNameOrId: string): Table | null {
		let table: Table = null
		try {
			table = base.getTable(tableNameOrId)
		} catch (error) {
			if (!table) {
				table = base.tables.find((t) => t.name === tableNameOrId) || null
			}
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
		const Table: Table =
			typeof table === 'string' ? tables.getTable(table) : (table as Table)
		let field: Field = null
		try {
			field = Table.getField(fieldNameOrId)
		} catch (error) {
			field = Table.fields.find((f) => f.name === fieldNameOrId) || null
		}
		return field
	},

	getFields(table: Table | string, fieldNamesOrIds: string[]): Field[] {
		const Table: Table =
			typeof table === 'string' ? tables.getTable(table) : (table as Table)
		const fields: Field[] = []
		const options = [...fieldNamesOrIds]
		options.forEach((opt, index) => {
			let field: Field = null
			try {
				field = Table.getField(opt)
			} catch (error) {
				field = Table.fields.find((f) => f.name === opt) || null
			}
			if (field) fields.push(field)
		})
		return fields
	},

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
		if (opts.refNames) {
			return Object.fromEntries(
				items.filter(([refName, mapping]) => opts.refNames.includes(refName))
			)
		} else {
			return Object.fromEntries(items)
		}
	},

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
		if (opts.refNames || opts.fieldIds) {
			const filter = opts.refNames || opts.fieldIds
			const fieldMappings = Object.entries(
				viewMapping.fields
			).filter(([refName, mapping]) => filter.includes(refName))
			return Object.fromEntries(fieldMappings)
		} else {
			return viewMapping.fields
		}
	},
}